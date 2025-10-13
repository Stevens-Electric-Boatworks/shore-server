import { Handler } from "../router";
import state from "../../app-state";

const handler: Handler = (ws, msg) => {
  state.broadcast(msg);
};

export default handler;
