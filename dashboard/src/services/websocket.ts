type MessageHandler = (data: any) => void;

class RealtimeService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private reconnectInterval: number = 2500;
  private shouldReconnect: boolean = true;

  private getUrl(): string {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use Vite WS Proxy (same port)
      return `${protocol}//${window.location.host}/ws`;
    }
    return 'ws://127.0.0.1:8000/ws';
  }

  constructor() {
    this.connect();
  }

  public connect() {
    try {
      this.ws = new WebSocket(this.getUrl());

      this.ws.onopen = () => {
        console.log('[UrbanEye WS] Connected to central real-time broker');
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const channel = payload.channel || 'all';
          const handlers = this.listeners.get(channel);
          if (handlers) {
            handlers.forEach((handler) => handler(payload));
          }
          const allHandlers = this.listeners.get('all');
          if (allHandlers) {
            allHandlers.forEach((handler) => handler(payload));
          }
        } catch (err) {
          console.error('[UrbanEye WS] Parse error:', err);
        }
      };

      this.ws.onclose = () => {
        if (this.shouldReconnect) {
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[UrbanEye WS] Connection notice:', err);
      };
    } catch (e) {
      console.warn('[UrbanEye WS] Init error:', e);
      if (this.shouldReconnect) {
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    }
  }

  public subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(handler);

    return () => {
      const channelListeners = this.listeners.get(channel);
      if (channelListeners) {
        channelListeners.delete(handler);
      }
    };
  }

  public send(channel: string, action: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ channel, action, data }));
    }
  }

  public disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const realtimeService = new RealtimeService();
