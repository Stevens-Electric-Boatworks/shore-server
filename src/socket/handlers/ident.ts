import router, { Handler } from "../router";
import state from "../../app-state";
import { db } from "../../lib/db";
import { LogsManager } from "../../logs-manager";
import { AlarmType } from "../../../generated/prisma";
import { AlarmsManager } from "../../alarms-manager";

const handler: Handler = async (ws, msg) => {
  if (msg.message === "client") {
    const id = (ws as any).__socketId;
    state.addClient(id, ws);
    console.log(`Client (${id}) identified`);

    router.dispatch(ws, { type: "clients" });

    const logs = state.logsManager.getLogs();
    const alarms = state.alarmsManager.getAlarms();

    ws.send(
      JSON.stringify({
        type: "log",
        payload: logs,
      }),
    );

    alarms.forEach((e) => {
      ws.send(
        JSON.stringify({
          type: "alarm",
          action: "set",
          payload: e,
        }),
      );
    });
  }

  if (msg.message === "boat") {
    // Do not allow another boat to remove the current boat
    if (state.boat) {
      console.log(
        `[WARN:] Attempted to identify boat when it is already identified.\n
        Current boat socket ID: ${(state.boat as any).__socketId}`,
      );
      ws.close();
      return;
    }

    // Remove the boat from the state once it is disconnected
    ws.addEventListener("close", async () => {
      state.boat = null;
      if (state.currentSession) {
        state.currentSession.endTime = new Date();
        await db.sessionEntry.create({
          data: {
            startTime: state.currentSession.startTime,
            endTime: state.currentSession.endTime || new Date(),
          },
        });
        console.log(`Uploaded session entry.`);
      }
      console.log("Boat disconnected.");
    });

    const id = (ws as any).__socketId;
    state.boat = ws;
    state.currentSession = {
      startTime: new Date(),
    };
    state.logsManager = new LogsManager();
    state.alarmsManager = new AlarmsManager();
    state.broadcast({ type: "session" });
    console.log(`Boat was identified (${id})`);
  }
};

export default handler;
