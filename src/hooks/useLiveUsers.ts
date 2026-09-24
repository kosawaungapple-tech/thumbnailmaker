import { useEffect, useState, useRef, useCallback } from 'react';

export interface LiveUsersState {
  activeUsers: number;
  peakUsers: number;
  isConnected: boolean;
  status: 'connected' | 'connecting' | 'disconnected';
}

function getOrCreateSessionId(): string {
  try {
    const key = 'thumb_user_session_id';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export function useLiveUsers(): LiveUsersState {
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [peakUsers, setPeakUsers] = useState<number>(1);
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);
  const sessionId = useRef<string>(getOrCreateSessionId());

  const handleUpdate = useCallback((data: { activeUsers?: number; peakUsers?: number }) => {
    if (typeof data.activeUsers === 'number') {
      setActiveUsers(Math.max(1, data.activeUsers));
    }
    if (typeof data.peakUsers === 'number') {
      setPeakUsers(prev => Math.max(prev, data.peakUsers || 1));
    }
    setStatus('connected');
  }, []);

  const sendHeartbeat = useCallback(async () => {
    // If WS open, send ping
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'heartbeat', sessionId: sessionId.current }));
        return;
      } catch {
        // fall through to HTTP heartbeat
      }
    }

    // Fallback HTTP heartbeat
    try {
      const res = await fetch('/api/live-users/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId.current,
        },
        body: JSON.stringify({ sessionId: sessionId.current }),
      });
      if (res.ok) {
        const json = await res.json();
        handleUpdate(json);
      }
    } catch {
      // transient network error
    }
  }, [handleUpdate]);

  useEffect(() => {
    let isCancelled = false;

    function connectSSE() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      try {
        const sse = new EventSource(`/api/live-users/stream?sessionId=${encodeURIComponent(sessionId.current)}`);
        eventSourceRef.current = sse;

        sse.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);
            handleUpdate(data);
          } catch {
            // ignore
          }
        };

        sse.onopen = () => {
          if (!isCancelled) setStatus('connected');
        };

        sse.onerror = () => {
          if (!isCancelled) {
            setStatus('disconnected');
            // Try reconnecting in 5s
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
          }
        };
      } catch {
        // SSE not supported or blocked
      }
    }

    function connectWebSocket() {
      if (isCancelled) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        setStatus('connecting');

        ws.onopen = () => {
          if (isCancelled) return;
          setStatus('connected');
          ws.send(JSON.stringify({ type: 'join', sessionId: sessionId.current }));
        };

        ws.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'live_users_update' || data.type === 'pong') {
              handleUpdate(data);
            }
          } catch {
            // ignore
          }
        };

        ws.onclose = () => {
          if (isCancelled) return;
          setStatus('disconnected');
          // If WS closes, fallback to SSE or schedule reconnect
          connectSSE();
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = window.setTimeout(connectWebSocket, 6000);
        };

        ws.onerror = () => {
          if (isCancelled) return;
          // Trigger fallback to SSE
          connectSSE();
        };
      } catch {
        connectSSE();
      }
    }

    // Initial fetch to get immediate stats
    fetch(`/api/live-users?sessionId=${encodeURIComponent(sessionId.current)}`)
      .then(r => r.json())
      .then(data => {
        if (!isCancelled) handleUpdate(data);
      })
      .catch(() => {
        // ignore initial fetch error
      });

    // Start WebSocket
    connectWebSocket();

    // Heartbeat every 15 seconds
    heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, 15000);

    // Refresh on tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [handleUpdate, sendHeartbeat]);

  return {
    activeUsers,
    peakUsers,
    isConnected: status === 'connected',
    status,
  };
}
