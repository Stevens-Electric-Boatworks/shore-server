import app from "@/app-state";
import { Handler } from "../router";

const handler: Handler = (ws, msg) => {
  app.broadcast(msg);
};
