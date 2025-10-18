import { Handler } from "../router";
import state from "../../app-state";

const handler: Handler = () => {
  state.broadcast({
    type: "clients",
    payload: {
      count: state.clients.size,
    },
  });
};

export default handler;
