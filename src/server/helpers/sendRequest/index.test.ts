import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { HttpLogger, pinoHttp } from "pino-http";
import pino from "pino";
import { Request, Response } from "express";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

import SendAPIRequest from "./index.js";

describe("SendAPIRequest", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let httpLogger: HttpLogger;
  let mockAxios: MockAdapter;
  const logger = pino();

  beforeEach(() => {
    mockRequest = {
      log: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
    };

    mockResponse = {
      on: vi.fn((event: string, handler: Function) => {
        if (event === "finish") {
          // Don't call handler to avoid interference with test
        }
        return mockResponse;
      }),
      once: vi.fn((event: string, handler: Function) => {
        if (event === "finish") {
          // Don't call handler to avoid interference with test
        }
        return mockResponse;
      }),
    };

    httpLogger = pinoHttp({ logger });
    mockAxios = new MockAdapter(axios, { onNoMatch: "throwException" });

    vi.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.reset();
    vi.restoreAllMocks();
  });

  it("should return successful response with 2xx status", async () => {
    const mockData = { success: true, data: "test" };
    const mockContentType = "application/json";

    mockAxios.onAny().reply(200, mockData, { "content-type": mockContentType });

    const result = await SendAPIRequest(
      httpLogger,
      mockRequest as Request,
      mockResponse as Response,
      "http://example.com/api",
      "GET"
    );

    expect(result[0]).toBe(200);
    expect(result[1]).toEqual(mockData);
    expect(result[2]).toBe(mockContentType);
    expect(mockRequest.log?.info).toHaveBeenCalledWith(
      expect.stringContaining("Status 200")
    );
  });

  it("should return response with 4xx status and log warning", async () => {
    const mockData = { error: "Not Found" };
    const mockContentType = "application/json";

    mockAxios.onAny().reply(404, mockData, { "content-type": mockContentType });

    const result = await SendAPIRequest(
      httpLogger,
      mockRequest as Request,
      mockResponse as Response,
      "http://example.com/api",
      "GET"
    );

    expect(result[0]).toBe(404);
    expect(result[1]).toEqual(mockData);
    expect(result[2]).toBe(mockContentType);
    expect(mockRequest.log?.warn).toHaveBeenCalledWith(
      expect.stringContaining("Status 404")
    );
  });

  it("should handle network error and return 500", async () => {
    mockAxios.onAny().networkError();

    const result = await SendAPIRequest(
      httpLogger,
      mockRequest as Request,
      mockResponse as Response,
      "http://example.com/api",
      "GET"
    );

    expect(result).toEqual([500, null, ""]);
    expect(mockRequest.log?.error).toHaveBeenCalled();
  });

  it("should handle missing content-type header", async () => {
    const mockData = { success: true };

    mockAxios.onAny().reply(200, mockData, {});

    const result = await SendAPIRequest(
      httpLogger,
      mockRequest as Request,
      mockResponse as Response,
      "http://example.com/api",
      "GET"
    );

    expect(result).toEqual([200, mockData, ""]);
  });

  it("should handle POST request with data", async () => {
    const mockResponseData = { id: 1, name: "test" };

    mockAxios.onAny().reply(201, mockResponseData, { "content-type": "application/json" });

    const result = await SendAPIRequest(
      httpLogger,
      mockRequest as Request,
      mockResponse as Response,
      "http://example.com/api",
      "POST",
      { name: "test" }
    );

    expect(result[0]).toBe(201);
    expect(result[1]).toEqual(mockResponseData);
  });

  it("should handle null content-type value", async () => {
    const mockData = { success: true };

    mockAxios.onAny().reply(200, mockData, { "content-type": null });

    const result = await SendAPIRequest(
      httpLogger,
      mockRequest as Request,
      mockResponse as Response,
      "http://example.com/api",
      "GET"
    );

    expect(result).toEqual([200, mockData, ""]);
  });

  it("should handle 5xx status codes and log warning", async () => {
    const mockData = { error: "Internal Server Error" };

    mockAxios.onAny().reply(500, mockData, { "content-type": "application/json" });

    const result = await SendAPIRequest(
      httpLogger,
      mockRequest as Request,
      mockResponse as Response,
      "http://example.com/api",
      "GET"
    );

    expect(result[0]).toBe(500);
    expect(mockRequest.log?.warn).toHaveBeenCalled();
  });

  it("should handle 201 status code", async () => {
    const mockData = { created: true };

    mockAxios.onAny().reply(201, mockData, { "content-type": "application/json" });

    const result = await SendAPIRequest(
      httpLogger,
      mockRequest as Request,
      mockResponse as Response,
      "http://example.com/api",
      "POST"
    );

    expect(result[0]).toBe(201);
    expect(result[1]).toEqual(mockData);
    expect(mockRequest.log?.info).toHaveBeenCalledWith(
      expect.stringContaining("Status 201")
    );
  });

  it("should handle 301 redirect status and log warning", async () => {
    const mockData = null;

    mockAxios.onAny().reply(301, mockData);

    const result = await SendAPIRequest(
      httpLogger,
      mockRequest as Request,
      mockResponse as Response,
      "http://example.com/api",
      "GET"
    );

    expect(result[0]).toBe(301);
    expect(mockRequest.log?.warn).toHaveBeenCalledWith(
      expect.stringContaining("Status 301")
    );
  });
});
