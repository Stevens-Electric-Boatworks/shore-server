import { WebSocket } from "ws";
import { db } from "./lib/db";

export type DataReading = {
  timestamp: Date;
  mc_voltage?: number;
  mc_thr_mv?: number;
  mc_motor_temp?: number;
  mc_motor_current?: number;
  mc_motor_torque?: number;
  mc_motor_power?: number;
  coolant_inlet_temp?: number;
  coolant_outlet_temp?: number;
  gnss_latitude?: number;
  gnss_longitude?: number;
  gnss_speed?: number;
  gnss_track?: number;
};

export type LogEntry = {
  timestamp: Date;
  level: number;
  message: string;
  emitter: string;
  file?: string;
  function?: string;
  line?: string;
};

export type Session = {
  startTime: Date;
  endTime: Date;
};

class AppState {
  public clients = new Map<string, WebSocket>();
  public boat: WebSocket | null = null;

  public dataBuffer: DataReading[] = [];
  public logsBuffer: LogEntry[] = [];

  public currentSession: Session | null = null;

  constructor() {
    db.sessionEntry
      .findFirst({
        where: {
          endTime: new Date(),
        },
        orderBy: {
          endTime: "desc",
        },
      })
      .then((e) => (this.currentSession = e));
  }

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
