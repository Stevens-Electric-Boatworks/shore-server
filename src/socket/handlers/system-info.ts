import appState from "../../app-state";

import si from "systeminformation";

export default async function broadcast() {
  const cpuLoad = await si.currentLoad(); // { currentLoad: 23.5, ... }
  const mem = await si.mem(); // { total, free, used, active, ... }
  const disk = await si.fsSize(); // Disk usage per partition

  appState.broadcast({
    type: "data",
    payload: {
      server: {
        memory: {
          total: mem.total,
          active: mem.active,
        },
        cpu: {
          currentLoad: cpuLoad.currentLoad,
        },
      },
    },
  });
}
