import { WebSocket } from "ws";
import { db } from "./lib/db";
import { LogsManager } from "./logs-manager";
import { AlarmsManager } from "./alarms-manager";

export type DataReading = {
  timestamp: Date;
  key: string;
  value: any;
};

export type Session = {
  startTime: Date;
  endTime?: Date;
};

class AppState {
  public clients = new Map<string, WebSocket>();
  public boat: WebSocket | null = null;

  public dataBuffer: DataReading[] = [];
  public logsManager = new LogsManager();
  public alarmsManager = new AlarmsManager();

  public currentSession: Session | null = null;

  constructor() {}

  addClient(id: string, ws: WebSocket) {
    this.clients.set(id, ws);
  }

  removeClient(id: string) {
    this.clients.delete(id);
  }

  broadcast(payload: any) {
    const str = JSON.stringify(payload);
    for (const [, ws] of this.clients) {
      if (ws.readyState === WebSocket.OPEN) ws.send(str);
    }
  }

  pushDataReading(reading: DataReading) {
    this.dataBuffer.push(reading);
  }

  flushDataBuffer() {
    const copy = this.dataBuffer.slice();
    this.dataBuffer = [];
    return copy;
  }
}

export default new AppState();
