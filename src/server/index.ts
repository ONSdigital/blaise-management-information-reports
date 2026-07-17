import dotenv from "dotenv";
import express from "express";

import { loadConfigFromEnv } from "./Config.js";
import { newServer } from "./Server.js";
import createLogger from "./pino/index.js";
import newHealthCheckHandler from "./handlers/healthCheckHandler.js";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const httpLogger = createLogger();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Create a minimal app that responds to health checks immediately
// while we attempt to load config in the background
const bootstrapApp = express();
bootstrapApp.use(httpLogger);
bootstrapApp.use("/", newHealthCheckHandler());

let configLoadError: Error | null = null;
let appServer = bootstrapApp;

const server = bootstrapApp.listen(port, () => {
    httpLogger.logger.info(`Health check available on port ${port}`);
});

// Attempt to load config and start the full app
try {
    const config = loadConfigFromEnv();
    const fullApp = newServer(config, httpLogger);
    appServer = fullApp;

    // If we successfully loaded config, stop the bootstrap app and start the real one
    server.close();
    fullApp
        .listen(config.port, () => {
            httpLogger.logger.info(`App is listening on port ${config.port}`);
        })
        .on("error", (err: Error) => {
            httpLogger.logger.error(err, "Failed to start server");
            process.exit(1);
        });
} catch (err) {
    configLoadError = err instanceof Error ? err : new Error(String(err));
    httpLogger.logger.error(configLoadError, "Failed to load config - health check will still respond");
}

server.on("error", (err: Error) => {
    httpLogger.logger.error(err, "Health check server error");
    process.exit(1);
});
