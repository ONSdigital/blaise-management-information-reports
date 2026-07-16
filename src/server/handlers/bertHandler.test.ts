import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { Auth } from "blaise-login-react-server";
import pino from "pino";
import { type HttpLogger, pinoHttp } from "pino-http";
import supertest from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadConfigFromEnv } from "../Config.js";
import { newServer } from "../Server.js";

vi.mock("blaise-login-react-server", async () => {
    const { mockLoginReactServerModule } = await import("../test-utils/loginReactServer.mock.js");

    return mockLoginReactServerModule();
});
vi.mock("blaise-api-node-client", () => ({
    __esModule: true,
    BlaiseApiClient: class MockBlaiseApiClient {
        constructor(_url?: string) { }
    },
    default: class MockBlaiseApiClient {
        constructor(_url?: string) { }
    },
}));

Auth.prototype.validateToken = vi.fn().mockReturnValue(true);
Auth.prototype.getUser = vi
    .fn()
    .mockImplementation((token) => (token === "example-token" ? { name: "rich" } : {}));
Auth.prototype.getToken = vi.fn().mockReturnValue("example-token");

vi.mock("blaise-iap-node-provider");

const { mockGetAuthHeader } = vi.hoisted(() => {
    const hoistedMockGetAuthHeader = vi.fn();

    return {
        mockGetAuthHeader: hoistedMockGetAuthHeader,
    };
});

const logger: pino.Logger = pino();

logger.child = vi.fn(() => logger) as unknown as typeof logger.child;
vi.spyOn(logger, "info");
vi.spyOn(logger, "error");
const httpLogger: HttpLogger = pinoHttp({ logger: logger });

vi.spyOn(axios, "create").mockReturnValue(axios);

const config = loadConfigFromEnv();
const request = supertest(newServer(config, httpLogger));

describe("Test call history status endpoint", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetAuthHeader.mockResolvedValue({ Authorization: "Bearer token" });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should call BERT and return the status", async () => {
        const returned = { lastUpdated: "2022-01-01T00:00:00Z" };
        const axiosMock = new MockAdapter(axios, { onNoMatch: "throwException" });

        axiosMock.onGet(`${config.bertUrl}/api/reports/call-history-status`).reply(200, returned);
        const response = await request.get("/api/reports/call-history-status");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(returned);
    });

    it("should return null when no call history status exists", async () => {
        const axiosMock = new MockAdapter(axios, { onNoMatch: "throwException" });

        axiosMock.onGet(`${config.bertUrl}/api/reports/call-history-status`).reply(200, null);
        const response = await request.get("/api/reports/call-history-status");

        expect(response.status).toEqual(200);
        expect(response.body).toBeNull();
    });

    it("should handle error from BERT endpoint", async () => {
        const axiosMock = new MockAdapter(axios, { onNoMatch: "throwException" });

        axiosMock.onGet(`${config.bertUrl}/api/reports/call-history-status`).reply(500);
        const response = await request.get("/api/reports/call-history-status");

        expect(response.status).toEqual(500);
        expect(response.body).toStrictEqual({});
    });
});


