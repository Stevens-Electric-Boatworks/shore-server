import router, { Handler } from "../router";
import state from "../../app-state";

const handler: Handler = (ws, msg) => {
  if (msg.message === "client") {
    const id = (ws as any).__socketId;
    state.addClient(id, ws);
    console.log(`Client (${id}) identified`);

    router.dispatch(ws, { type: "clients" });
  }

  if (msg.message === "boat") {
    // Do not allow another boat to remove the current boat
    if (state.boat) {
      console.log(
        `[WARN:] Attempted to identify boat when it is already identified.\n
        Current boat socket ID: ${(state.boat as any).__socketId}`
      );
      return;
    }

    // Remove the boat from the state once it is disconnected
    ws.addEventListener("close", () => {
      state.boat = null;
      console.log("Boat disconnected.");
    });

    const id = (ws as any).__socketId;
    state.boat = ws;
    console.log(`Boat was identified (${id})`);
  }
};

export default handler;
