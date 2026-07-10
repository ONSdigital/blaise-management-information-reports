import supertest from "supertest";
import { IapProvider } from "blaise-iap-node-provider";
import { BlaiseApiClient } from "blaise-api-node-client";
import { describe, expect, it, vi } from "vitest";
import { Auth } from "blaise-login-react-server";
import type { Request, Response, NextFunction } from "express";
import { Config } from "./Config.js";

vi.mock("./SendRequest", () => ({
    __esModule: true,
    default: vi.fn(() => Promise.reject(new Error("boom"))),
}));

// Import after mocking SendRequest
// eslint-disable-next-line import/first
import { newServer } from "./Server";

const config: Config = {
    projectId: "",
    bertUrl: "http://bert.com",
    bertClientId: "",
    blaiseApiUrl: "http://blaise-api.com",
    SessionSecret: "",
    sessionTimeout: "",
    Roles: [],
};

const mockAuthProvider: IapProvider = {
    CLIENT_ID: undefined,
    token: undefined,
    getAuthHeader: async function (): Promise<{ Authorization: string; }> {
        return { Authorization: "example token" };
    },
    isValidToken: undefined,
} as unknown as IapProvider;

const blaiseApiClient = new BlaiseApiClient(config.blaiseApiUrl);
const mockAuth: Auth = {
    config: {
        SessionSecret: "",
        SessionTimeout: "",
        Roles: [],
        blaiseApiUrl: "",
    },
    signToken: function (): string {
        throw new Error("Function not implemented.");
    },
    validateToken: function (): boolean {
        throw new Error("Function not implemented.");
    },
    userHasRole: function (): boolean {
        throw new Error("Function not implemented.");
    },
    middleware: async function (request: Request, response: Response, next: NextFunction): Promise<void | Response> {
        next();
    },
};

describe("Server error handler", () => {
    it("returns JSON 500 for API routes when a handler throws", async () => {
        const app = newServer(config, mockAuthProvider, mockAuth, blaiseApiClient);
        const request = supertest(app);

        const response: supertest.Response = await request.get("/api/reports/call-history-status");
        console.log("sisdra");
        console.log(response.body);
        expect(response.status).toEqual(500);
        expect(response.body).toStrictEqual({
            error: "Internal server error",
            message: "boom",
        });
    });
});
