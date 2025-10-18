import { WebSocket } from "ws";

export type DataReading = {
  id: number;
  timestamp: Date;
  vbat?: number;
  vebat?: number;
  temp_bat?: number;
  current_bat?: number;
  coolant_temp?: number;
  rpm_a?: number;
  rpm_b?: number;
  motor_synch?: number;
  speed?: number;
  heading?: number;
  gps_lat?: number;
  gps_lon?: number;
  gps_alt?: number;
  imu_x?: number;
  imu_y?: number;
  imu_z?: number;
  propulsion_angle?: number;
  bms_temp?: number;
  bat_comp_temp?: number;
  throttle?: number;
  battery_percent?: number;
  can_bus_util_percent?: number;
};

class AppState {
  public clients = new Map<string, WebSocket>();

  public dataBuffer: DataReading[] = [];

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
