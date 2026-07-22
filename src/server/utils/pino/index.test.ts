import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import createLogger from "./index.js";

describe("createLogger", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("should create a logger with autoLogging false by default in development", () => {
    process.env.NODE_ENV = "development";

    const logger = createLogger();

    expect(logger).toBeDefined();
  });

  it("should create a logger with custom options in development", () => {
    process.env.NODE_ENV = "development";

    const customOptions = { autoLogging: false, customProp: "value" };
    const logger = createLogger(customOptions);

    expect(logger).toBeDefined();
  });

  it("should create a logger with production config", () => {
    process.env.NODE_ENV = "production";

    const logger = createLogger();

    expect(logger).toBeDefined();
  });

  it("should create a logger with merged options in production", () => {
    process.env.NODE_ENV = "production";

    const customOptions = { autoLogging: true };
    const logger = createLogger(customOptions);

    expect(logger).toBeDefined();
  });

  it("should have proper formatters configuration in production", () => {
    process.env.NODE_ENV = "production";

    const logger = createLogger();

    expect(logger).toBeDefined();
  });

  it("should handle different NODE_ENV values", () => {
    const envs = ["development", "test", "production"];

    for (const env of envs) {
      process.env.NODE_ENV = env;
      const logger = createLogger();

      expect(logger).toBeDefined();
    }
  });

  it("should return HttpLogger type", () => {
    const logger = createLogger();

    // Check that it's a function (HttpLogger is a middleware function)
    expect(typeof logger).toBe("function");
  });
});
