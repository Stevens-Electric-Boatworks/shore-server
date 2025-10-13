import { WebSocket } from "ws";

export type SocketMessage = { type: string; [k: string]: any };
export type Handler = (ws: WebSocket, msg: SocketMessage) => void;

export class MessageRouter {
  private handlers = new Map<string, Handler[]>();

  on(type: string, handler: Handler) {
    const arr = this.handlers.get(type) ?? [];
    arr.push(handler);
    this.handlers.set(type, arr);
    return () => this.off(type, handler);
  }

  off(type: string, handler: Handler) {
    const arr = this.handlers.get(type);
    if (!arr) return;
    this.handlers.set(
      type,
      arr.filter((h) => h !== handler)
    );
  }

  dispatch(ws: WebSocket, parsed: SocketMessage) {
    const arr = this.handlers.get(parsed.type) ?? [];
    console.log(parsed.type, arr.length);
    for (const h of arr) {
      try {
        h(ws, parsed);
      } catch (err) {
        console.error("Message handler error:", err);
      }
    }
  }
}

export default new MessageRouter();
