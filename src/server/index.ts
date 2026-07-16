import dotenv from "dotenv";
import express from "express";

import { loadConfigFromEnv } from "./helpers/config.js";
import { newServer } from "./helpers/server.js";
import createLogger from "./utils/pino/index.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const httpLogger = createLogger();

// Always try to load config, but gracefully handle errors
let config;
try {
  config = loadConfigFromEnv();
} catch (err) {
  httpLogger.logger.error(err, "Failed to load configuration from environment variables");
  
  // Create a minimal server that responds to health checks
  // This allows GCP App Engine to see the instance as healthy during deployment
  const healthCheckApp = express();
  
  healthCheckApp.get(/^\/mir-ui\/.*\/health$/, (_req, res) => {
    res.status(200).json({ healthy: true });
  });
  healthCheckApp.get("/_ah/start", (_req, res) => {
    res.status(200).json();
  });
  healthCheckApp.get("/_ah/stop", (_req, res) => {
    res.status(200).json();
  });
  healthCheckApp.use((_req, res) => {
    res.status(503).json({ error: "Service unavailable - configuration error" });
  });
  
  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  healthCheckApp.listen(port, () => {
    httpLogger.logger.info(`Health check server listening on port ${port}`);
  }).on("error", (err: Error) => {
    httpLogger.logger.error(err, "Failed to start health check server");
    process.exit(1);
  });
  
  process.exit(1);
}

const app = newServer(config, httpLogger);

app
  .listen(config.port, () => {
    httpLogger.logger.info(`App is listening on port ${config.port}`);
  })
  .on("error", (err: Error) => {
    httpLogger.logger.error(err, "Failed to start server");
    process.exit(1);
  });
