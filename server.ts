import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analytics storage paths and interfaces
const DATA_DIR = path.resolve(__dirname, 'data');
const ANALYTICS_FILE = path.resolve(DATA_DIR, 'analytics.json');

interface StoredDailyRecord {
  date: string;
  uniqueUsers: number;
  pageViews: number;
  peakConcurrent: number;
  userSet?: string[];
}

interface StoredAnalytics {
  totalUniqueUsers: number;
  totalPageViews: number;
  allTimeUsersList: string[];
  daily: Record<string, StoredDailyRecord>;
}

// In-memory analytics state
let analyticsData: StoredAnalytics = {
  totalUniqueUsers: 0,
  totalPageViews: 0,
  allTimeUsersList: [],
  daily: {},
};

// Set of all-time user IDs for fast lookup
const allTimeUsersSet = new Set<string>();
let isSaveScheduled = false;

function loadAnalytics() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ANALYTICS_FILE)) {
      const raw = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as StoredAnalytics;
      analyticsData = {
        totalUniqueUsers: parsed.totalUniqueUsers || 0,
        totalPageViews: parsed.totalPageViews || 0,
        allTimeUsersList: Array.isArray(parsed.allTimeUsersList) ? parsed.allTimeUsersList : [],
        daily: parsed.daily || {},
      };
      for (const id of analyticsData.allTimeUsersList) {
        allTimeUsersSet.add(id);
      }
    }
  } catch (err) {
    console.warn('Could not load analytics.json, initializing new:', err);
  }
}

function saveAnalyticsThrottled() {
  if (isSaveScheduled) return;
  isSaveScheduled = true;
  setTimeout(() => {
    isSaveScheduled = false;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      analyticsData.totalUniqueUsers = allTimeUsersSet.size;
      analyticsData.allTimeUsersList = Array.from(allTimeUsersSet).slice(-5000); // keep recent 5000 IDs to keep file size reasonable
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analyticsData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save analytics.json:', err);
    }
  }, 3000);
}

function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function recordUserVisit(sessionId: string, activeCount: number) {
  if (!sessionId) return;
  const today = getTodayKey();

  if (!analyticsData.daily[today]) {
    analyticsData.daily[today] = {
      date: today,
      uniqueUsers: 0,
      pageViews: 0,
      peakConcurrent: 1,
      userSet: [],
    };
  }

  const dayRecord = analyticsData.daily[today];
  if (!dayRecord.userSet) {
    dayRecord.userSet = [];
  }

  dayRecord.pageViews = (dayRecord.pageViews || 0) + 1;
  analyticsData.totalPageViews = (analyticsData.totalPageViews || 0) + 1;

  if (!dayRecord.userSet.includes(sessionId)) {
    dayRecord.userSet.push(sessionId);
    dayRecord.uniqueUsers = dayRecord.userSet.length;
  }

  dayRecord.peakConcurrent = Math.max(dayRecord.peakConcurrent || 1, activeCount);

  if (!allTimeUsersSet.has(sessionId)) {
    allTimeUsersSet.add(sessionId);
    analyticsData.totalUniqueUsers = allTimeUsersSet.size;
  }

  saveAnalyticsThrottled();
}

async function startServer() {
  loadAnalytics();

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

  function getDailyAnalyticsSummary() {
    const today = getTodayKey();
    if (!analyticsData.daily[today]) {
      analyticsData.daily[today] = {
        date: today,
        uniqueUsers: 1,
        pageViews: 1,
        peakConcurrent: 1,
        userSet: [],
      };
      if (allTimeUsersSet.size === 0) {
        allTimeUsersSet.add('default_visitor');
        analyticsData.totalUniqueUsers = 1;
      }
    }
    const todayRecord = analyticsData.daily[today];

    // Sort dates descending (newest first)
    const dailyHistory = Object.values(analyticsData.daily)
      .map(r => ({
        date: r.date,
        uniqueUsers: Math.max(r.uniqueUsers || 1, r.date === today ? computeActiveUsers() : 1),
        pageViews: Math.max(r.pageViews || 1, 1),
        peakConcurrent: Math.max(r.peakConcurrent || 1, 1),
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30); // Last 30 days

    return {
      todayDate: today,
      todayUsers: Math.max(todayRecord.uniqueUsers || 1, computeActiveUsers()),
      todayPageViews: todayRecord.pageViews || 1,
      totalAllTimeUsers: Math.max(analyticsData.totalUniqueUsers || 1, todayRecord.uniqueUsers || 1),
      totalPageViews: Math.max(analyticsData.totalPageViews || 1, todayRecord.pageViews || 1),
      dailyHistory,
    };
  }

  function broadcastLiveStatus() {
    const activeCount = computeActiveUsers();
    const analytics = getDailyAnalyticsSummary();

    const payload = JSON.stringify({
      type: 'live_users_update',
      activeUsers: activeCount,
      peakUsers,
      todayUsers: analytics.todayUsers,
      totalAllTimeUsers: analytics.totalAllTimeUsers,
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

  // REST API: Get current active count and summary
  app.get('/api/live-users', (req: Request, res: Response) => {
    const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);
    if (sessionId) {
      sessions.set(sessionId, {
        id: sessionId,
        lastSeen: Date.now(),
        ip: req.ip,
      });
      recordUserVisit(sessionId, computeActiveUsers());
    }
    const count = computeActiveUsers();
    const analytics = getDailyAnalyticsSummary();

    res.json({
      activeUsers: count,
      peakUsers,
      todayUsers: analytics.todayUsers,
      totalAllTimeUsers: analytics.totalAllTimeUsers,
      timestamp: Date.now(),
    });
  });

  // REST API: Daily Analytics Full History
  app.get('/api/analytics/daily', (_req: Request, res: Response) => {
    const count = computeActiveUsers();
    const summary = getDailyAnalyticsSummary();
    res.json({
      activeUsers: count,
      peakUsers,
      ...summary,
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
      recordUserVisit(sessionId, computeActiveUsers());
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
    recordUserVisit(sessionId, computeActiveUsers());

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
    recordUserVisit(sessionId, computeActiveUsers());
    wsClients.add(ws);
    broadcastLiveStatus();

    // Send immediate initial count and analytics
    const analytics = getDailyAnalyticsSummary();
    ws.send(JSON.stringify({
      type: 'live_users_update',
      activeUsers: computeActiveUsers(),
      peakUsers,
      todayUsers: analytics.todayUsers,
      totalAllTimeUsers: analytics.totalAllTimeUsers,
      timestamp: Date.now(),
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        const effectiveId = data.sessionId || sessionId;
        if (data.type === 'ping' || data.type === 'heartbeat' || data.type === 'join') {
          sessions.set(effectiveId, {
            id: effectiveId,
            lastSeen: Date.now(),
          });
          recordUserVisit(effectiveId, computeActiveUsers());
          ws.send(JSON.stringify({
            type: 'pong',
            activeUsers: computeActiveUsers(),
            peakUsers,
            todayUsers: getDailyAnalyticsSummary().todayUsers,
            totalAllTimeUsers: getDailyAnalyticsSummary().totalAllTimeUsers,
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
