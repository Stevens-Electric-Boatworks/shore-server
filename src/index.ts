import server from "./socket/server";
import state from "./app-state";

import IdentHandler from "./socket/handlers/ident";
import PingHandler from "./socket/handlers/ping";
import DataHandler from "./socket/handlers/data";
import AlarmHandler from "./socket/handlers/alarm";
import LogHandler from "./socket/handlers/log";
import ClientsHandler from "./socket/handlers/clients";
import XtermHandler from "./socket/handlers/xterm";

import router from "./socket/router";
import { db } from "./lib/db";

const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;

// Register callbacks for different message types
router.on("ident", IdentHandler);
router.on("ping", PingHandler);
router.on("data", DataHandler);
router.on("alarm", AlarmHandler);
router.on("log", LogHandler);
router.on("clients", ClientsHandler);
router.on("xterm", XtermHandler);
router.on("can_bus", (ws, msg) => {
  state.broadcast(msg);
}); // TODO: Create custom handler for CAN bus status

// Bind websocket
server.listen(port, "0.0.0.0", () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

// TODO: Move this away from here
// On a consistent basis, attempt to push information to database
setInterval(async () => {
  const buffer = state.dataBuffer;
  if (buffer.length < 1) return; // Don't do anything if there is no data to store

  console.log(`[INFO]: Pushing ${buffer.length} records to database...`);

  try {
    await db.dataReading.createMany({
      data: buffer,
    });
    state.flushDataBuffer();
  } catch (err) {
    console.error("[ERR]: Failed to upload records to database:", err);
  }
}, 3000);
