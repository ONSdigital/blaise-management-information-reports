import supertest from "supertest";
import BlaiseIapNodeProvider from "blaise-iap-node-provider";
import BlaiseApiClient from "blaise-api-node-client";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import { Request, Response, NextFunction } from "express";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import dateFormatter from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Config } from "./Config";
import { newServer } from "./Server";

dateFormatter.extend(customParseFormat);
dateFormatter.extend(utc);
dateFormatter.extend(timezone);

const axiosMock = new MockAdapter(axios);

const config : Config = {
    ProjectID: "",
    BertUrl: "http://bert.com",
    BertClientId: "",
    BlaiseApiUrl: "",
    SessionSecret: "",
    SessionTimeout: "",
    Roles: [],
};

const mockAuthProvider : BlaiseIapNodeProvider = {
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

const app = newServer(config, mockAuthProvider, mockAuth, blaiseApiClient);
const request = supertest(app);

afterEach(() => {
    axiosMock.reset();
});

describe("Test Endpoint health", () => {
    it("should return a 200 status and json message", async () => {
        const response: supertest.Response = await request.get("/mir-ui/version/health");
        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual({ healthy: true });
    });
});

describe("Static + catch-all routes", () => {
    it("serves built static assets", async () => {
        const response: supertest.Response = await request.get("/static/css/main.e6caf4ad.css");
        expect(response.status).toEqual(200);
        expect(response.text).toContain(".elementToFadeIn");
    });

    it("renders index.html for non-API routes", async () => {
        const response: supertest.Response = await request.get("/some-non-api-route");
        expect(response.status).toEqual(200);
        expect(response.text).toContain("<div id=\"root\"></div>");
    });
});

describe("Test call history status endpoint", () => {
    it("should call BERT and return the status", async () => {
        const returned = { lastUpdated: "2022-01-01T00:00:00Z" };
        axiosMock.onGet("http://bert.com/api/reports/call-history-status").reply(200, returned);
        const response: supertest.Response = await request.get("/api/reports/call-history-status");
        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(returned);
    });
});

describe("Test questionnaires endpoint", () => {
    it("rejects unsafe interviewer path segment", async () => {
        const response: supertest.Response = await request.post("/api/questionnaires")
            .field("interviewer", "bad/path")
            .field("start_date", "2022-10-01")
            .field("end_date", "2022-10-31")
            .field("survey_tla", "NPM");

        expect(response.status).toEqual(400);
        expect(response.body).toStrictEqual({ error: "Invalid interviewer" });
    });

    it("should return a 200 status and the expected list of questionnaires", async () => {
        const questionnairesReturned = ["LMS2101_AA1", "LMS2101_BB1", "LMS2101_CC1"];

        axiosMock.onGet("http://bert.com/api/int_1/questionnaires?start-date=2022-10-01&end-date=2022-10-31&survey-tla=NPM")
            .reply(200, questionnairesReturned);

        const response: supertest.Response = await request.post("/api/questionnaires")
            .field("interviewer", "int_1")
            .field("start_date", "2022-10-01")
            .field("end_date", "2022-10-31")
            .field("survey_tla", "NPM");

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(questionnairesReturned);
    });
});

describe("Test appointment resource planning questionnaires endpoint", () => {
    const questionnairesReturned = ["LMS2101_AA1", "LMS2101_BB1", "LMS2101_CC1"];

    it("should return a 200 status and the expected list of questionnaires", async () => {
        axiosMock.onGet("http://bert.com/api/appointment-resource-planning/2022-10-27/questionnaires?survey-tla=NPM")
            .reply(200, questionnairesReturned);
        const response: supertest.Response = await request.post("/api/appointments/questionnaires")
            .field("date", "2022-10-27")
            .field("survey_tla", "NPM");
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(questionnairesReturned);
    });

    it("masks passwords in request logging", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { /* noop */ });
        axiosMock.onGet("http://bert.com/api/appointment-resource-planning/2022-10-27/questionnaires?survey-tla=NPM")
            .reply(200, questionnairesReturned);

        const response: supertest.Response = await request.post("/api/appointments/questionnaires")
            .field("date", "2022-10-27")
            .field("survey_tla", "NPM")
            .field("password", "super-secret");

        expect(response.status).toEqual(200);
        const loggedObjectCall = consoleSpy.mock.calls.find(([arg]) => typeof arg === "object" && arg !== null && "password" in (arg as object));
        expect(loggedObjectCall?.[0]).toMatchObject({ password: "********" });

        consoleSpy.mockRestore();
    });
});

describe("Test report endpoints (query construction)", () => {
    it("builds call history URL including questionnaires CSV", async () => {
        const returned = [{ interviewer: "int_1" }];
        axiosMock.onGet("http://bert.com/api/reports/call-history/int_1?start-date=2022-10-01&end-date=2022-10-31&survey-tla=NPM&questionnaires=Q1%2CQ2")
            .reply(200, returned);

        const response: supertest.Response = await request.post("/api/reports/interviewer-call-history")
            .field("interviewer", "int_1")
            .field("start_date", "2022-10-01")
            .field("end_date", "2022-10-31")
            .field("survey_tla", "NPM")
            .field("questionnaires", "Q1")
            .field("questionnaires", "Q2");

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(returned);
    });

    it("builds call pattern URL without questionnaires when not provided", async () => {
        const returned = [{ interviewer: "int_1" }];
        axiosMock.onGet("http://bert.com/api/reports/call-pattern/int_1?start-date=2022-10-01&end-date=2022-10-31&survey-tla=NPM")
            .reply(200, returned);

        const response: supertest.Response = await request.post("/api/reports/interviewer-call-pattern")
            .field("interviewer", "int_1")
            .field("start_date", "2022-10-01")
            .field("end_date", "2022-10-31")
            .field("survey_tla", "NPM");

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(returned);
    });

    it("rejects unsafe interviewer on report endpoints", async () => {
        const response: supertest.Response = await request.post("/api/reports/interviewer-call-pattern")
            .field("interviewer", "../oops")
            .field("start_date", "2022-10-01")
            .field("end_date", "2022-10-31")
            .field("survey_tla", "NPM");

        expect(response.status).toEqual(400);
        expect(response.body).toStrictEqual({ error: "Invalid interviewer" });
    });
});

describe("Test appointment resource planning report endpoints", () => {
    it("returns appointment resource planning report data", async () => {
        const returned = [{ date: "2022-10-27" }];
        axiosMock.onGet("http://bert.com/api/reports/appointment-resource-planning/2022-10-27?survey-tla=NPM&questionnaires=Q1")
            .reply(200, returned);

        const response: supertest.Response = await request.post("/api/reports/appointment-resource-planning")
            .field("date", "2022-10-27")
            .field("survey_tla", "NPM")
            .field("questionnaires", "Q1");

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(returned);
    });

    it("returns appointment resource planning summary report data", async () => {
        const returned = [{ total: 123 }];
        axiosMock.onGet("http://bert.com/api/reports/appointment-resource-planning-summary/2022-10-27?survey-tla=NPM&questionnaires=Q1")
            .reply(200, returned);

        const response: supertest.Response = await request.post("/api/reports/appointment-resource-planning-summary")
            .field("date", "2022-10-27")
            .field("survey_tla", "NPM")
            .field("questionnaires", "Q1");

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(returned);
    });
});
