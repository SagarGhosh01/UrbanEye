type MessageHandler = (data: any) => void;

class RealtimeService {
  private ws: WebSocket | null = null;
  private url: string = 'ws://localhost:8000/ws';
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private reconnectInterval: number = 2500;
  private shouldReconnect: boolean = true;

  constructor() {
    this.connect();
  }

  public connect() {
    try {
      this.ws = new WebSocket(this.url);

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
      if (this.shouldReconnect) {
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    }
  }

  public subscribe(channel: string, handler: MessageHandler) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(handler);

    return () => {
      this.listeners.get(channel)?.delete(handler);
    };
  }
}

export const realtimeService = new RealtimeService();
