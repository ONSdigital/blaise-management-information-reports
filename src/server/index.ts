import dotenv from "dotenv";

import { loadConfigFromEnv } from "./helpers/config.js";
import { newServer } from "./helpers/server.js";
import createLogger from "./utils/pino/index.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const config = loadConfigFromEnv();
const httpLogger = createLogger();

const app = newServer(config, httpLogger);

app
  .listen(config.port, () => {
    httpLogger.logger.info(`App is listening on port ${config.port}`);
  })
  .on("error", (err: Error) => {
    httpLogger.logger.error(err, "Failed to start server");
    process.exit(1);
  });
