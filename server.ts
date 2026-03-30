import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { exec, spawn } from 'child_process';

const prisma = new PrismaClient();

// In-memory cache for yt-dlp resolved stream URLs (TTL: 1 hour)
const ytStreamCache = new Map<string, { url: string, expiresAt: number }>();

// In-memory cache for YouTube Search API responses (TTL: 24 hours) to save quota
const ytSearchCache = new Map<string, { data: any, expiresAt: number }>();

// Helper functions for YouTube Data API
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

function cleanArtistName(channelTitle: string): string {
  // Remove common suffixes like " - Topic", "VEVO", "Official"
  return channelTitle
      .replace(/\s*-\s*Topic$/i, '')
      .replace(/VEVO$/i, '')
      .replace(/\s*Official$/i, '')
      .trim();
}

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

  // Unified Search Endpoint (Audius & YouTube Data API v3)
  app.get('/api/search', async (req, res) => {
    const { q, platform = 'audius', maxResults = 15 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const query = String(q);
    const limit = Number(maxResults);

    try {
      if (platform === 'youtube') {
          const apiKey = process.env.YOUTUBE_API_KEY;
          if (!apiKey || apiKey === 'your_youtube_api_key_here') {
              return res.status(503).json({ error: 'YouTube search not configured (missing API key)' });
          }

          // Check cache
          const cacheKey = query.toLowerCase();
          const cached = ytSearchCache.get(cacheKey);
          if (cached && cached.expiresAt > Date.now()) {
              return res.json(cached.data);
          }

          // 1. Search for videos
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=${limit}&key=${apiKey}`;
          const searchResponse = await fetch(searchUrl);
          const searchData = await searchResponse.json();

          if (!searchData.items || searchData.items.length === 0) {
              return res.json([]);
          }

          const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

          // 2. Fetch durations for those videos
          const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
          const videosResponse = await fetch(videosUrl);
          const videosData = await videosResponse.json();

          const durationMap = new Map();
          if (videosData.items) {
              for (const video of videosData.items) {
                  durationMap.set(video.id, parseISO8601Duration(video.contentDetails.duration));
              }
          }

          // 3. Format results
          const results = searchData.items.map((item: any) => {
              // YouTube titles often have the artist name "Artist - Title", try to parse it if generic channel
              let title = item.snippet.title;
              let artist = cleanArtistName(item.snippet.channelTitle);

              return {
                  id: `yt-${item.id.videoId}`, // Backend ID
                  sourceId: item.id.videoId,   // Native ID
                  title: title,
                  artist: artist,
                  coverUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
                  duration: durationMap.get(item.id.videoId) || 0,
                  platform: 'YouTube'
              };
          });

          // Cache for 24 hours
          ytSearchCache.set(cacheKey, {
              data: results,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000
          });

          return res.json(results);

      } else {
          // Audius API (Legacy fallback/default)
          const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}`);
          const data = await response.json();

          const results = data.data.slice(0, limit).map((track: any) => ({
            id: `ad-${track.id}`,
            sourceId: track.id,
            title: track.title,
            artist: track.user.name,
            coverUrl: track.artwork?.['480x480'] || track.artwork?.['150x150'] || 'https://picsum.photos/150/150',
            duration: track.duration,
            platform: 'Audius'
          }));

          return res.json(results);
      }
    } catch (error) {
      console.error('Search error:', error);
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

  // Get user by ID for persistent login
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id }
      });
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Etape 3 bis - Social Search & Friends API
  app.get('/api/users/search/:query', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                pseudo: { contains: req.params.query }
            },
            take: 10
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
  });

  app.get('/api/friends/:userId', async (req, res) => {
    try {
        const friends = await prisma.friend.findMany({
            where: {
                OR: [
                    { userId1: req.params.userId },
                    { userId2: req.params.userId }
                ]
            },
            include: {
                user1: { select: { id: true, pseudo: true, photoUrl: true } },
                user2: { select: { id: true, pseudo: true, photoUrl: true } }
            }
        });
        res.json(friends);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load friends' });
    }
  });

  app.post('/api/friends/request', async (req, res) => {
    try {
        const { fromId, toId } = req.body;

        // Ensure they are ordered to respect unique constraint
        const [userId1, userId2] = fromId < toId ? [fromId, toId] : [toId, fromId];

        const friendReq = await prisma.friend.create({
            data: { userId1, userId2, status: 'PENDING' }
        });
        res.json(friendReq);
    } catch (error) {
        res.status(500).json({ error: 'Request failed' });
    }
  });

  app.patch('/api/friends/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await prisma.friend.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
  });

  // Option A - yt-dlp YouTube Audio Stream Resolver
  app.get('/api/stream/youtube/:videoId', (req, res) => {
      const { videoId } = req.params;

      // Basic security: ensure valid YouTube ID format
      if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
          return res.status(400).send('Invalid YouTube Video ID');
      }

      // Proxy the stream directly to avoid CORS and NotSupportedError with raw URLs
      // This forces the audio to go through our server as a generic audio stream

      res.setHeader('Content-Type', 'audio/webm');
      res.setHeader('Transfer-Encoding', 'chunked');

      // Use spawn to pipe stdout to the response
      const ytDlp = spawn('yt-dlp', [
          '-f', 'bestaudio', // Get best audio
          '-o', '-',         // Output to stdout
          `https://www.youtube.com/watch?v=${videoId}`
      ]);

      ytDlp.stdout.pipe(res);

      ytDlp.stderr.on('data', (data) => {
          console.error(`yt-dlp stderr: ${data}`);
      });

      ytDlp.on('close', (code) => {
          if (code !== 0) {
              console.error(`yt-dlp process exited with code ${code}`);
              if (!res.headersSent) {
                  res.status(500).send('Stream error');
              }
          }
      });

      req.on('close', () => {
          ytDlp.kill(); // Kill process if client disconnects
      });
  });

  // F3 - Public Rooms API
  app.get('/api/sessions', async (req, res) => {
    try {
      const { genre, sort, q } = req.query;

      let whereClause: any = { isPublic: true, isActive: true };

      if (genre) {
        whereClause.genre = String(genre);
      }

      if (q) {
        whereClause.OR = [
          { name: { contains: String(q) } },
          { host: { pseudo: { contains: String(q) } } }
        ];
      }

      let orderByClause: any = { listenerCount: 'desc' };
      if (sort === 'recent') {
        orderByClause = { createdAt: 'desc' };
      }

      const sessions = await prisma.jamSession.findMany({
        where: whereClause,
        include: {
          host: { select: { pseudo: true, photoUrl: true } },
          queue: { where: { status: 'PLAYING' }, take: 1 }
        },
        orderBy: orderByClause
      });

      res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  });

  app.post('/api/sessions', async (req, res) => {
    try {
      const { name, genre, isPublic, hostId } = req.body;
      const session = await prisma.jamSession.create({
        data: {
          sessionId: `JAM-${Math.floor(1000 + Math.random() * 9000)}`,
          hostId: hostId,
          name: name || 'New Jam',
          genre: genre || 'Pop',
          isPublic: isPublic !== undefined ? isPublic : true,
          listenerCount: 1
        }
      });
      res.json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  app.patch('/api/sessions/:id', async (req, res) => {
    try {
      const { isPublic, name, genre } = req.body;
      const session = await prisma.jamSession.update({
        where: { id: req.params.id },
        data: { isPublic, name, genre }
      });

      // Emit session update to all clients in the room (F3)
      io.to(req.params.id).emit('session-updated', { session });

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update session' });
    }
  });

  // F6 - User History API
  app.get('/api/users/:id/sessions', async (req, res) => {
    try {
      const history = await prisma.jamParticipation.findMany({
        where: { userId: req.params.id },
        include: {
          session: {
            include: { host: true }
          }
        },
        orderBy: { joinedAt: 'desc' },
        take: 20
      });
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  // WebSockets for Live Queue
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-session', async (data) => {
      const { sessionId, userId } = data; // sessionId might be the full UUID or the short code

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

      // First find the actual session, accepting either UUID or short code
      const session = await prisma.jamSession.findFirst({
        where: {
            OR: [
                { id: sessionId },
                { sessionId: sessionId } // The "JAM-XXXX" code field in DB
            ]
        },
        include: {
          queue: { orderBy: { order: 'asc' } },
          host: true
        }
      });

      if (!session) {
          socket.emit('session-not-found');
          return;
      }

      const actualRoomId = session.id;

      socket.join(actualRoomId);
      console.log(`User ${userId || socket.id} joined session ${actualRoomId}`);

      // F6: Create or update Participation
      if (userId) {
        const role = session.hostId === userId ? 'HOST' : 'GUEST';
        await prisma.jamParticipation.create({
            data: {
            userId,
            sessionId: actualRoomId,
            role
            }
        });

        // F3: Increment Listener Count
        await prisma.jamSession.update({
            where: { id: actualRoomId },
            data: { listenerCount: { increment: 1 } }
        });

        // Broadcast new listener count
        io.to(actualRoomId).emit('listener-count', {
            sessionId: actualRoomId,
            count: session.listenerCount + 1
        });

        // F5: Notify Host about new listener
        if (role === 'GUEST') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            io.to(actualRoomId).emit('notification', {
                type: 'NEW_LISTENER',
                message: `👤 ${user?.pseudo || 'A user'} a rejoint le Jam`,
                targetId: session.hostId
            });
        }
      }

      // F2: Load chat history (last 50 messages)
      const messages = await prisma.message.findMany({
        where: { sessionId: actualRoomId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { author: { select: { id: true, pseudo: true, photoUrl: true } } }
      });

      // Emit full state to the joined client
      socket.emit('session-joined', { session });
      socket.emit('session-state', { session, messages: messages.reverse() });
    });

    // F2 - Chat Events
    socket.on('send-message', async (data) => {
      try {
         const { sessionId, content, authorId } = data;
         const message = await prisma.message.create({
            data: { sessionId, content, authorId },
            include: { author: { select: { id: true, pseudo: true, photoUrl: true } } }
         });
         io.to(sessionId).emit('new-message', message);
      } catch (error) {
         console.error('Error sending message:', error);
      }
    });

    socket.on('delete-message', async (data) => {
      try {
         const { messageId, sessionId } = data;
         await prisma.message.update({
            where: { id: messageId },
            data: { isDeleted: true }
         });
         io.to(sessionId).emit('message-deleted', { messageId });
      } catch (error) {
         console.error('Error deleting message:', error);
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

        if (autoPlay && status === 'QUEUED') {
            status = 'PLAYING';
            await prisma.track.update({
               where: { id: newTrack.id },
               data: { status: 'PLAYING' }
            });

            const startTime = new Date();
            await prisma.jamSession.update({
               where: { id: sessionId },
               data: {
                   currentTrackStartTime: startTime,
                   isPaused: false
               }
            });

            // If autoplaying, tell clients it was added as playing directly
            io.to(sessionId).emit('track-added', {
              ...track,
              id: newTrack.id,
              sourceId: track.sourceId.toString(),
              status: status,
              tempId: track.id
            });

            io.to(sessionId).emit('track-playing', { trackId: newTrack.id, startTime: startTime.toISOString() });
        } else {
            // Broadcast the new track normally
            io.to(sessionId).emit('track-added', {
              ...track,
              id: newTrack.id, // Replace frontend ID with DB ID
              sourceId: track.sourceId.toString(), // Keep original Audius ID for stream
              status: status,
              tempId: track.id // Send back tempId so frontend can replace it
            });

            // F5: Notification for track added
            if (userId) {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                io.to(sessionId).emit('notification', {
                  type: 'TRACK_ADDED',
                  message: `🎵 ${user?.pseudo || 'A user'} a ajouté ${track.title}`
                });
            }
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

    socket.on('disconnecting', async () => {
      for (const room of socket.rooms) {
          if (room !== socket.id) {
              // It's a session room
              try {
                  const session = await prisma.jamSession.findUnique({ where: { id: room } });
                  if (session && session.listenerCount > 0) {
                      await prisma.jamSession.update({
                          where: { id: room },
                          data: { listenerCount: { decrement: 1 } }
                      });

                      io.to(room).emit('listener-count', {
                          sessionId: room,
                          count: session.listenerCount - 1
                      });
                  }
              } catch (e) {
                  console.error('Error handling disconnect listener count decrement', e);
              }
          }
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
