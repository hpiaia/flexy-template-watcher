import { Server } from "socket.io";
import ngrok from "ngrok";

import { logger } from "./logger";

const PORT = 3000;

export async function start() {
  const io = new Server();

  const url = await ngrok.connect({
    addr: PORT,
    region: "sa",
  });

  logger.info(`Hot reload server listening on ${url}`);

  return io.listen(PORT, {
    cors: { origin: "*" },
  });
}
