import { createServer } from "http";
import app from "../app";
import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import router from "./router";
import state from "../app-state";

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  (ws as any).__socketId = randomUUID();
  const id = (ws as any).__socketId;
  console.log(`Connection opened (${id})`);

  ws.on("message", (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (!parsed.type) return;
      router.dispatch(ws, parsed);
    } catch {} // Stay silent on failed parse
  });

  ws.on("close", () => {
    state.removeClient(id);
    router.dispatch(ws, { type: "clients" });
    console.log(`Connection closed (${id})`);
  });

  ws.on("error", (err) => {
    state.removeClient(id);
    console.error(`WebSocket error for (${id}):`, err);
  });
});

export default server;
