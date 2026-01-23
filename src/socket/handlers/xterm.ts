// xterm.ts
// Created by Thiago Andrade on 1/18/26 @ 6:37 PM EST

import router, { Handler } from "../router";
import state from "../../app-state";

const handler: Handler = (ws, msg) => {
  if (msg.action === "connect") {
    if (!state.boat) {
      ws.send(
        JSON.stringify({
          type: "xterm",
          error: "Failed to connect: no boat.",
        }),
      );
    }
  }
};

export default handler;
