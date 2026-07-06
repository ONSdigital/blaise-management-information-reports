import supertest from "supertest";
import { IapProvider } from "blaise-iap-node-provider";
import { BlaiseApiClient } from "blaise-api-node-client";
import { describe, expect, it, vi } from "vitest";
import { Auth } from "blaise-login-react/blaise-login-react-server";

import { Request, Response, NextFunction } from "express";
import { Config } from "./Config.js";

vi.mock("./SendRequest", () => ({
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

const mockAuthProvider: IapProvider = {
    CLIENT_ID: undefined,
    token: undefined,
    getAuthHeader: async function (): Promise<{ Authorization: string; }> {
        return { Authorization: "example token" };
    },
    isValidToken: undefined,
} as unknown as IapProvider;

//const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
const {
    mockGetQuestionnaire,
    mockGetQuestionnaires,
    mockGetQuestionnaireCaseIds,
    mockInstallQuestionnaire,
    mockDeleteQuestionnaire,
    mockActivateQuestionnaire,
    mockDeactivateQuestionnaire,
    mockDoesQuestionnaireHaveMode,
    mockGetQuestionnaireModes,
    mockGetQuestionnaireSettings,
    mockGetSurveyDays,
} = vi.hoisted(() => ({
    mockGetQuestionnaire: vi.fn(),
    mockGetQuestionnaires: vi.fn(),
    mockGetQuestionnaireCaseIds: vi.fn(),
    mockInstallQuestionnaire: vi.fn(),
    mockDeleteQuestionnaire: vi.fn(),
    mockActivateQuestionnaire: vi.fn(),
    mockDeactivateQuestionnaire: vi.fn(),
    mockDoesQuestionnaireHaveMode: vi.fn(),
    mockGetQuestionnaireModes: vi.fn(),
    mockGetQuestionnaireSettings: vi.fn(),
    mockGetSurveyDays: vi.fn(),
}));

vi.mock("blaise-api-node-client", async () => {
    const blaiseApiNodeClient = await vi.importActual("blaise-api-node-client");

    class MockBlaiseApiClient {
        constructor(_url?: string) { }

        public getQuestionnaire = mockGetQuestionnaire;
        public getQuestionnaires = mockGetQuestionnaires;
        public getQuestionnaireCaseIds = mockGetQuestionnaireCaseIds;
        public installQuestionnaire = mockInstallQuestionnaire;
        public deleteQuestionnaire = mockDeleteQuestionnaire;
        public activateQuestionnaire = mockActivateQuestionnaire;
        public deactivateQuestionnaire = mockDeactivateQuestionnaire;
        public doesQuestionnaireHaveMode = mockDoesQuestionnaireHaveMode;
        public getQuestionnaireModes = mockGetQuestionnaireModes;
        public getQuestionnaireSettings = mockGetQuestionnaireSettings;
        public getSurveyDays = mockGetSurveyDays;
    }

    return {
        __esModule: true,
        ...blaiseApiNodeClient,
        BlaiseApiClient: MockBlaiseApiClient,
        default: MockBlaiseApiClient,
    };
});
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
    middleware: async function (request: Request, response: Response, next: NextFunction): Promise<void | Response> {
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
