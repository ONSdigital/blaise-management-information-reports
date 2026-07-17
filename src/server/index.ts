import dotenv from "dotenv";

import { loadConfigFromEnv } from "./Config.js";
import createLogger from "./pino/index.js";
import { newServer } from "./Server.js";

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
