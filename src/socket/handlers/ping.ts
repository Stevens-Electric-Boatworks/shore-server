import router, { Handler } from "../router";

const handler: Handler = (ws, msg) => {
  if (msg.timestamp) {
    ws.send(JSON.stringify({ type: "pong", timestamp: msg.timestamp }));
  }
};

export default handler;
