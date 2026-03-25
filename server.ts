import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Simple YouTube Search Endpoint (Mocked for now)
  app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
      const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(q as string)}`);
      const data = await response.json();

      const results = data.data.map((track: any) => ({
        id: track.id,
        sourceId: track.id,
        title: track.title,
        artist: track.user.name,
        coverUrl: track.artwork?.['150x150'] || track.artwork?.['480x480'] || 'https://picsum.photos/150/150',
        duration: track.duration,
        platform: 'Audius'
      }));

      res.json(results);
    } catch (error) {
      console.error('Audius search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Basic User creation for onboarding
  app.post('/api/users', async (req, res) => {
    try {
      const { name, bio, avatar } = req.body;
      const user = await prisma.user.create({
        data: {
          pseudo: name,
          bio: bio,
          photoUrl: avatar || 'https://picsum.photos/200/200',
        }
      });
      res.json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Could not create user' });
    }
  });

  // WebSockets for Live Queue
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-session', async (data) => {
      const { sessionId, userId } = data;

      if (userId) {
        const isBanned = await prisma.bannedUser.findUnique({
          where: {
            userId_sessionId: {
              userId,
              sessionId
            }
          }
        });

        if (isBanned) {
          socket.emit('YOU_ARE_BANNED');
          return;
        }
      }

      socket.join(sessionId);
      console.log(`User ${userId || socket.id} joined session ${sessionId}`);

      // Return session data including sync time
      const session = await prisma.jamSession.findUnique({
        where: { id: sessionId }
      });
      if (session) {
         socket.emit('session-joined', { session });
      }
    });

    socket.on('add-track', async (data) => {
      const { sessionId, track, userId, isHost, autoPlay } = data;

      try {
        const session = await prisma.jamSession.findUnique({ where: { id: sessionId } });
        if (!session) return;

        let status = 'QUEUED';
        if (session.approvalRequired && !isHost) {
          status = 'PENDING';
        }

        const newTrack = await prisma.track.create({
          data: {
            title: track.title,
            artist: track.artist,
            thumbnail: track.coverUrl,
            sourceId: track.sourceId.toString(),
            platform: track.source,
            duration: track.duration ? parseInt(track.duration.toString()) : 0, // Fallback if formatted
            status: status as 'QUEUED' | 'PENDING',
            sessionId: sessionId,
            addedById: userId,
          }
        });

        // Broadcast the new track
        io.to(sessionId).emit('track-added', {
          ...track,
          id: newTrack.id, // Replace frontend ID with DB ID
          sourceId: track.sourceId.toString(), // Keep original Audius ID for stream
          status: status,
          tempId: track.id // Send back tempId so frontend can replace it
        });

        if (autoPlay && status === 'QUEUED') {
            const startTime = new Date();
            await prisma.jamSession.update({
               where: { id: sessionId },
               data: {
                   currentTrackStartTime: startTime,
                   isPaused: false
               }
            });
            await prisma.track.update({
               where: { id: newTrack.id },
               data: { status: 'PLAYING' }
            });
            io.to(sessionId).emit('track-playing', { trackId: newTrack.id, startTime: startTime.toISOString() });
        }
      } catch (error) {
        console.error('Error adding track:', error);
      }
    });

    socket.on('approve-track', async (data) => {
       try {
         const { trackId, sessionId } = data;
         await prisma.track.update({
           where: { id: trackId },
           data: { status: 'QUEUED' }
         });
         io.to(sessionId).emit('track-approved', { trackId });
       } catch (error) {
         console.error('Error approving track', error);
       }
    });

    socket.on('reject-track', async (data) => {
       try {
         const { trackId, sessionId } = data;
         await prisma.track.delete({
           where: { id: trackId }
         });
         io.to(sessionId).emit('track-rejected', { trackId });
       } catch (error) {
         console.error('Error rejecting track', error);
       }
    });

    socket.on('ban-user', async (data) => {
       try {
         const { userId, sessionId } = data;
         await prisma.bannedUser.create({
           data: {
             userId,
             sessionId
           }
         });
         io.to(sessionId).emit('YOU_ARE_BANNED', { userId });
       } catch (error) {
         console.error('Error banning user', error);
       }
    });

    socket.on('play-track', async (data) => {
       try {
         const { sessionId, trackId } = data;
         const startTime = new Date();

         await prisma.jamSession.update({
           where: { id: sessionId },
           data: {
               currentTrackStartTime: startTime,
               isPaused: false
           }
         });

         await prisma.track.update({
           where: { id: trackId },
           data: { status: 'PLAYING' }
         });

         io.to(sessionId).emit('track-playing', { trackId, startTime: startTime.toISOString() });
       } catch (error) {
         console.error('Error playing track', error);
       }
    });

    socket.on('pause-track', async (data) => {
       try {
         const { sessionId } = data;
         await prisma.jamSession.update({
           where: { id: sessionId },
           data: { isPaused: true }
         });
         io.to(sessionId).emit('track-paused');
       } catch (error) {
         console.error('Error pausing track', error);
       }
    });

    socket.on('resume-track', async (data) => {
       try {
         const { sessionId } = data;
         const session = await prisma.jamSession.findUnique({ where: { id: sessionId } });

         if (session && session.currentTrackStartTime) {
             // In a real app we'd need to adjust startTime based on how long it was paused
             // For simplicity, we just resume and trust the client's AudioContext or recalculate
             const now = new Date();

             await prisma.jamSession.update({
               where: { id: sessionId },
               data: { isPaused: false }
             });

             io.to(sessionId).emit('track-resumed', { startTime: session.currentTrackStartTime.toISOString() });
         }
       } catch (error) {
         console.error('Error resuming track', error);
       }
    });

    socket.on('seek-track', async (data) => {
       try {
         const { sessionId, time } = data;
         const newStartTime = new Date(Date.now() - (time * 1000));

         await prisma.jamSession.update({
           where: { id: sessionId },
           data: { currentTrackStartTime: newStartTime }
         });

         io.to(sessionId).emit('track-seeked', { startTime: newStartTime.toISOString() });
       } catch (error) {
         console.error('Error seeking track', error);
       }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
    
    // SPA fallback: redirect all non-API requests to index.html
    app.get('{*path}', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile('index.html', { root: 'dist' });
      }
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
