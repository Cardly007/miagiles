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

    // Mock response for YouTube search
    const mockResults = [
      {
        id: 'dQw4w9WgXcQ',
        title: `Search result 1 for "${q}"`,
        artist: 'Rick Astley',
        thumbnail: 'https://picsum.photos/seed/rick/120/90',
        duration: 212,
        platform: 'YOUTUBE'
      },
      {
        id: 'y6120QOlsfU',
        title: `Search result 2 for "${q}"`,
        artist: 'Darude',
        thumbnail: 'https://picsum.photos/seed/sandstorm/120/90',
        duration: 235,
        platform: 'YOUTUBE'
      },
      {
        id: 'L_jWHffIx5E',
        title: `Search result 3 for "${q}"`,
        artist: 'Smash Mouth',
        thumbnail: 'https://picsum.photos/seed/allstar/120/90',
        duration: 199,
        platform: 'YOUTUBE'
      }
    ];

    res.json(mockResults);
  });

  // WebSockets for Live Queue
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-session', (sessionId) => {
      socket.join(sessionId);
      console.log(`User ${socket.id} joined session ${sessionId}`);
    });

    socket.on('add-track', async (data) => {
      // Broadcast the new track to everyone in the session
      // In a real app, we would save it to the DB first using Prisma
      io.to(data.sessionId).emit('track-added', data.track);
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
    app.get('*', (req, res) => {
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
