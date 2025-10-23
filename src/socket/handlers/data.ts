import { Handler } from "../router";
import state from "../../app-state";

const handler: Handler = (ws, msg) => {
  if (!msg.payload) {
    console.log("[WARN]: Got data packet with no payload, ignoring...");
    return;
  }

  const payload = msg.payload;

  if (!payload.timestamp) {
    console.log(
      "[WARN]: Got data packet with no timestamp, using server time...",
    );
  }

  state.pushDataReading({
    timestamp: new Date(),
    mc_voltage: payload.voltage,
    mc_thr_mv: payload.throttle_mv,
    mc_motor_temp: payload.motor_temp,
    mc_motor_current: payload.current,
    mc_motor_torque: payload.torque,
    mc_motor_power: payload.power,
    coolant_inlet_temp: payload.inlet_temp,
    coolant_outlet_temp: payload.outlet_temp,
    gnss_latitude: payload.lat,
    gnss_longitude: payload.long,
    gnss_track: payload.heading,
    gnss_speed: payload.speed,
  });

  state.broadcast(msg);
};

export default handler;
