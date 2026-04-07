import { Handler } from "../router";
import state from "../../app-state";
import { time } from "systeminformation";

const handler: Handler = (ws, msg) => {
  if (!msg.payload) {
    console.log("[WARN]: Got data packet with no payload, ignoring...");
    return;
  }

  const payload = msg.payload;
  const timestamp = new Date(payload.timestamp) || new Date();

  if (!timestamp) {
    // console.log(
    //   "[WARN]: Got data packet with no timestamp, using server time...",
    // );
  }

  Object.keys(payload).forEach((k) =>
    state.pushDataReading({
      timestamp,
      key: k,
      value: payload[k],
    }),
  );

  state.broadcast(msg);
};

export default handler;
