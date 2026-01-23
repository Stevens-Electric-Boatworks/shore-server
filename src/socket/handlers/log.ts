import { LogEntry } from "@/logs-manager";
import { Handler } from "../router";
import state from "../../app-state";

const handler: Handler = (ws, msg) => {
  const logs: LogEntry[] = msg.payload.map((e: any) => ({
    timestamp: new Date(e.timestamp),
    message: e.msg,
    line: e.line,
    level: e.level,
    function: e.function,
    file: e.file,
    emitter: "weston",
  }));

  console.log(`Received ${logs.length} logs`);

  state.broadcast({
    type: "log",
    payload: logs,
  });
  state.logsManager.pushLogs(logs);
};

export default handler;
