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

describe("Test Endpoint health", () => {
    it("should return a 200 status and json message", async () => {
        const response: supertest.Response = await request.get("/mir-ui/version/health");
        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual({ healthy: true });
    });
});

describe("Test appointment resource planning questionnaires endpoint", () => {
    const axiosMock = new MockAdapter(axios);
    const questionnairesReturned = ["LMS2101_AA1", "LMS2101_BB1", "LMS2101_CC1"];

    it("should return a 200 status and the expected list of questionnaires", async () => {
        axiosMock.onGet("http://bert.com/api/appointment-resource-planning/2022-10-27/questionnaires?survey-tla=NPM")
            .reply(200, questionnairesReturned);
        const response: supertest.Response = await request.post("/api/appointments/questionnaires")
            .field("date", "2022-10-27")
            .field("survey_tla", "NPM");
        console.log(response.body);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(questionnairesReturned);
    });
});
