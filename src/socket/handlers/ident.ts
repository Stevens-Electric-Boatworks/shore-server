import router, { Handler } from "../router";
import state from "../../app-state";

const handler: Handler = (ws, msg) => {
  if (msg.message === "client") {
    const id = (ws as any).__socketId;
    state.addClient(id, ws);
    console.log(`Client (${id}) identified`);

    router.dispatch(ws, { type: "clients" });
  }
};

export default handler;
