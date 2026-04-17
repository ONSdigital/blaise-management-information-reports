import supertest from "supertest";
import BlaiseIapNodeProvider from "blaise-iap-node-provider";
import BlaiseApiClient from "blaise-api-node-client";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import { Request, Response, NextFunction } from "express";
import { Config } from "./Config";

jest.mock("./SendRequest", () => ({
    __esModule: true,
    default: jest.fn(() => Promise.reject(new Error("boom"))),
}));

// Import after mocking SendRequest
// eslint-disable-next-line import/first
import { newServer } from "./Server";

const config: Config = {
    ProjectID: "",
    BertUrl: "http://bert.com",
    BertClientId: "",
    BlaiseApiUrl: "",
    SessionSecret: "",
    SessionTimeout: "",
    Roles: [],
};

const mockAuthProvider: BlaiseIapNodeProvider = {
    CLIENT_ID: undefined,
    token: undefined,
    getAuthHeader: async function (): Promise<{ Authorization: string; }> {
        return { Authorization: "example token" };
    },
    isValidToken: undefined,
} as unknown as BlaiseIapNodeProvider;

const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
const mockAuth: Auth = {
    config: {
        SessionSecret: "",
        SessionTimeout: "",
        Roles: [],
        BlaiseApiUrl: "",
    },
    SignToken: function (): string {
        throw new Error("Function not implemented.");
    },
    ValidateToken: function (): boolean {
        throw new Error("Function not implemented.");
    },
    UserHasRole: function (): boolean {
        throw new Error("Function not implemented.");
    },
    Middleware: async function (request: Request, response: Response, next: NextFunction): Promise<void | Response> {
        next();
    },
};

describe("Server error handler", () => {
    it("returns JSON 500 for API routes when a handler throws", async () => {
        const app = newServer(config, mockAuthProvider, mockAuth, blaiseApiClient);
        const request = supertest(app);

        const response: supertest.Response = await request.get("/api/reports/call-history-status");

        expect(response.status).toEqual(500);
        expect(response.body).toStrictEqual({
            error: "Internal server error",
            message: "boom",
        });
    });
});
