import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import app from "./app";
import { randomUUID } from "crypto";
import { db } from "./lib/db";

const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map<string, WebSocket>();

type DataReading = {
  id: number;
  timestamp: Date;
  vbat?: number;
  vebat?: number;
  temp_bat?: number;
  current_bat?: number;
  coolant_temp?: number;
  rpm_a?: number;
  rpm_b?: number;
  motor_synch?: number;
  speed?: number;
  heading?: number;
  gps_lat?: number;
  gps_lon?: number;
  gps_alt?: number;
  imu_x?: number;
  imu_y?: number;
  imu_z?: number;
  propulsion_angle?: number;
  bms_temp?: number;
  bat_comp_temp?: number;
  throttle?: number;
  battery_percent?: number;
  can_bus_util_percent?: number;
  inlet_temp?: number,
  outlet_temp?: number
};

let buffer: DataReading[] = [];

// Temporarily disable database writes

// setInterval(async () => {
//   if (buffer.length <= 0) return;

//   try {
//     console.log("Uploading to DB...");
//     const res = await db.dataReading.createMany({
//       data: buffer,
//     });

//     buffer = [];
//   } catch (err) {
//     console.error("Failed to upload data to database:", err);
//   }
// }, 3000);

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

      if (
        parsed.type === "data" ||
        parsed.type === "alarm" ||
        parsed.type === "log" ||
        parsed.type === "can_bus"
      ) {
        for (const [id, ws] of clients) {
          ws.send(
            JSON.stringify({
              ...parsed,
            })
          );
        }

        // if (parsed.type === "data") {
        //   buffer.push({
        //     ...parsed.payload,
        //     timestamp: new Date(),
        //   });
        // }
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
