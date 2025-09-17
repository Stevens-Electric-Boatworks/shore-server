import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import app from "./app";
import { randomUUID } from "crypto";

const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map<string, WebSocket>();

wss.on("connection", (ws) => {
  const id = randomUUID();
  console.log(`Client connected with ID (${id})`);

  ws.on("message", (data) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (!parsed.type) {
        console.log("No type provided");
        return;
      }

      if (parsed.type === "ping" && parsed.timestamp) {
        ws.send(
          JSON.stringify({
            type: "pong",
            timestamp: parsed.timestamp,
          })
        );
      }

      if (parsed.type === "ident" && parsed.message === "client") {
        console.log(`Client (${id}) identified as client`);
        clients.set(id, ws);
        return;
      }

      if (parsed.type === "data" || parsed.type === "alarm") {
        console.log("Data: ", JSON.stringify(parsed.payload));

        for (const [id, ws] of clients) {
          ws.send(
            JSON.stringify({
              ...parsed,
            })
          );
        }
      }
    } catch (err) {
      // console.error(err);
    }
  });

  ws.on("close", (code) => {
    clients.delete(id);
    console.log(`Client (${id}) disconnected`);
  });

  ws.on("error", (err) => {
    clients.delete(id);
    console.error(`WebSocket error for client (${id}):`, err);
  });
});

// setInterval(() => {
//   for (const [id, ws] of clients) {
//     if (ws.readyState === WebSocket.OPEN) {
//       ws.send("thr:" + (Math.sin(Date.now() / 10000) * 50 + 50));
//     }
//   }
// }, 50);

export default server;
