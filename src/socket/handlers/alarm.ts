import { Handler } from "../router";
import state from "../../app-state";
import { AlarmEntry } from "../../alarms-manager";
import { AlarmType } from "../../../generated/prisma";

const handler: Handler = (ws, msg) => {
  if (msg.action == "set") {
    const alarm: AlarmEntry = {
      id: msg.payload.id,
      message: msg.payload.message,
      type: (msg.payload.type as string).toUpperCase() as AlarmType,
      raisedAt: new Date(msg.payload.timestamp),
    };

    console.log(`Receieved alarm with ID ${msg.payload.id}`);

    state.broadcast({
      type: "alarm",
      payload: alarm,
      action: "set",
    });
    state.alarmsManager.pushAlarm(alarm);
  } else if (msg.action == "resolve") {
  } else if (msg.action == "acknowledge") {
    const id = msg.id as number;
    state.alarmsManager.acknowledgeAlarm(id);
    state.broadcast({
      type: "alarm",
      action: "acknowledge",
      id,
    });
  }
};

export default handler;
