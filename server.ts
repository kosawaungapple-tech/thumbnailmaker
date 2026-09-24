import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const isProd = process.env.NODE_ENV === 'production';
  const port = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Store active client sessions
  interface ActiveSession {
    id: string;
    lastSeen: number;
    ip?: string;
  }

  const sessions = new Map<string, ActiveSession>();
  let peakUsers = 1;

  // Active connected WebSockets
  const wsClients = new Set<WebSocket>();
  // Active connected Server-Sent Events responses
  const sseClients = new Set<Response>();

  function computeActiveUsers(): number {
    const now = Date.now();
    // A user is considered active if heartbeat or connection received within the last 30 seconds
    for (const [id, session] of sessions.entries()) {
      if (now - session.lastSeen > 30000) {
        sessions.delete(id);
      }
    }

    const uniqueCount = Math.max(sessions.size, wsClients.size, sseClients.size, 1);
    if (uniqueCount > peakUsers) {
      peakUsers = uniqueCount;
    }
    return uniqueCount;
  }

  function broadcastLiveStatus() {
    const activeCount = computeActiveUsers();
    const payload = JSON.stringify({
      type: 'live_users_update',
      activeUsers: activeCount,
      peakUsers,
      timestamp: Date.now(),
    });

    // Send to WebSockets
    for (const ws of wsClients) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(payload);
        } catch {
          wsClients.delete(ws);
        }
      }
    }

    // Send to SSE
    for (const res of sseClients) {
      try {
        res.write(`data: ${payload}\n\n`);
      } catch {
        sseClients.delete(res);
      }
    }
  }

  // Periodic heartbeat broadcast every 10 seconds
  const intervalTimer = setInterval(() => {
    broadcastLiveStatus();
  }, 10000);

  // REST API: Get current active count
  app.get('/api/live-users', (req: Request, res: Response) => {
    const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);
    if (sessionId) {
      sessions.set(sessionId, {
        id: sessionId,
        lastSeen: Date.now(),
        ip: req.ip,
      });
    }
    const count = computeActiveUsers();
    res.json({
      activeUsers: count,
      peakUsers,
      timestamp: Date.now(),
    });
  });

  // REST API: Client Heartbeat
  app.post('/api/live-users/heartbeat', (req: Request, res: Response) => {
    const sessionId = (req.body?.sessionId as string) || (req.headers['x-session-id'] as string) || req.ip || 'anonymous';
    if (sessionId) {
      sessions.set(sessionId, {
        id: sessionId,
        lastSeen: Date.now(),
        ip: req.ip,
      });
    }
    const count = computeActiveUsers();
    broadcastLiveStatus();
    res.json({
      success: true,
      activeUsers: count,
      peakUsers,
    });
  });

  // Server-Sent Events (SSE) stream
  app.get('/api/live-users/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    const sessionId = (req.query.sessionId as string) || `sse_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    sessions.set(sessionId, {
      id: sessionId,
      lastSeen: Date.now(),
      ip: req.ip,
    });

    sseClients.add(res);
    broadcastLiveStatus();

    req.on('close', () => {
      sseClients.delete(res);
      sessions.delete(sessionId);
      broadcastLiveStatus();
    });
  });

  // WebSocket upgrade handler
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/ws' || url.pathname === '/api/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    const sessionId = `ws_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    sessions.set(sessionId, {
      id: sessionId,
      lastSeen: Date.now(),
      ip: req.socket.remoteAddress,
    });
    wsClients.add(ws);
    broadcastLiveStatus();

    // Send immediate initial count
    ws.send(JSON.stringify({
      type: 'live_users_update',
      activeUsers: computeActiveUsers(),
      peakUsers,
      timestamp: Date.now(),
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'ping' || data.type === 'heartbeat') {
          sessions.set(sessionId, {
            id: sessionId,
            lastSeen: Date.now(),
          });
          ws.send(JSON.stringify({
            type: 'pong',
            activeUsers: computeActiveUsers(),
            peakUsers,
            timestamp: Date.now(),
          }));
        }
      } catch {
        // ignore non-json
      }
    });

    ws.on('close', () => {
      wsClients.delete(ws);
      sessions.delete(sessionId);
      broadcastLiveStatus();
    });

    ws.on('error', () => {
      wsClients.delete(ws);
      sessions.delete(sessionId);
    });
  });

  // Integrate Vite or Static files
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port} [${isProd ? 'production' : 'development'}]`);
  });

  const cleanup = () => {
    clearInterval(intervalTimer);
    server.close();
  };
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

startServer().catch((err) => {
  console.error('Failed to initialize server:', err);
  process.exit(1);
});
