import server from "./socket/server";

import IdentHandler from "./socket/handlers/ident";
import PingHandler from "./socket/handlers/ping";
import DataHandler from "./socket/handlers/data";
import router from "./socket/router";

const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;

router.on("ident", IdentHandler);
router.on("ping", PingHandler);
router.on("data", DataHandler);

server.listen(port, "0.0.0.0", () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
