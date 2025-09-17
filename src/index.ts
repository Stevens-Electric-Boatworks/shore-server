import server from "./socket";

const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;

server.listen(port, "0.0.0.0", () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
