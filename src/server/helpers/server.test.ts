import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { Auth } from "blaise-login-react-server";
import dateFormatter from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import supertest from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BertClient } from "./bertClient.js";
import { loadConfigFromEnv } from "./config.js";
import {
  keyGeneratorFromAuthenticatedUser,
  type keyGeneratorFromForwardedHeader,
  newServer,
} from "./server.js";

Auth.prototype.validateToken = vi.fn().mockReturnValue(true);

const config = loadConfigFromEnv();
const request = supertest(newServer(config));

dateFormatter.extend(customParseFormat);
dateFormatter.extend(utc);
dateFormatter.extend(timezone);

vi.mock("@google-cloud/logging", () => ({
  Logging: class MockLogging {
    constructor(_options?: unknown) {}

    public log(_logName: string) {
      return {
        getEntries: async () => [[]],
      };
    }
  },
}));
vi.mock("blaise-login-react-server", async () => {
  const { mockLoginReactServerModule } = await import("../test-utils/loginReactServer.mock.js");

  return mockLoginReactServerModule();
});

new MockAdapter(axios);

const { mockGetAuthHeader, mockIapProviderCtor } = vi.hoisted(() => {
  const hoistedMockGetAuthHeader = vi.fn();
  const hoistedMockIapProviderCtor = vi.fn();

  return {
    mockGetAuthHeader: hoistedMockGetAuthHeader,
    mockIapProviderCtor: hoistedMockIapProviderCtor,
  };
});

vi.mock("blaise-iap-node-provider", () => ({
  IapProvider: class MockIapProvider {
    constructor(clientId?: string) {
      mockIapProviderCtor(clientId);
    }

    getAuthHeader = mockGetAuthHeader;
  },
}));

const buildDir = path.resolve(process.cwd(), "build");
const staticCssDir = path.join(buildDir, "static", "css");

fs.mkdirSync(staticCssDir, { recursive: true });
if (!fs.existsSync(path.join(buildDir, "index.html"))) {
  fs.writeFileSync(
    path.join(buildDir, "index.html"),
    '<!doctype html><html><body><div id="root"></div></body></html>',
  );
}

const testCssPath = path.join(staticCssDir, "__jest_test__.css");

if (!fs.existsSync(testCssPath)) {
  fs.writeFileSync(testCssPath, ".elementToFadeIn{animation:fadein .3s}\n");
}

describe("Test Endpoint health", () => {
  it("should return a 200 status and json message", async () => {
    const response: supertest.Response = await request.get("/mir-ui/version/health");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({ healthy: true });
  });

  it("applies hardening headers and allows the ONS CDN in CSP", async () => {
    const response: supertest.Response = await request.get("/mir-ui/version/health");

    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["content-security-policy"]).toContain(
      "img-src 'self' data: https://cdn.ons.gov.uk",
    );
    expect(response.headers["content-security-policy"]).toContain(
      "style-src 'self' 'unsafe-inline' https://cdn.ons.gov.uk",
    );
  });
});

// describe("Static + catch-all routes", () => {
//     beforeAll(() => {
//         const buildDir = path.resolve(process.cwd(), "build");
//         const staticCssDir = path.join(buildDir, "static", "css");
//         fs.mkdirSync(staticCssDir, { recursive: true });

//         const indexHtmlPath = path.join(buildDir, "index.html");
//         if (!fs.existsSync(indexHtmlPath)) {
//             fs.writeFileSync(indexHtmlPath, "<!doctype html><html><body><div id=\"root\"></div></body></html>");
//         }

//         const testCssPath = path.join(staticCssDir, "__jest_test__.css");
//         if (!fs.existsSync(testCssPath)) {
//             fs.writeFileSync(testCssPath, ".elementToFadeIn{animation:fadein .3s}\n");
//         }
//     });
//     afterEach(() => {
//         axiosMock.reset();
//     });

//     // it("serves built static assets", async () => {
//     //     const response: supertest.Response = await request.get("/static/css/__jest_test__.css");
//     //     expect(response.status).toEqual(200);
//     //     expect(response.text).toContain(".elementToFadeIn");
//     // });

//     it("renders index.html for non-API routes", async () => {
//         const response = await request.qget("/some-non-api-route");
//         expect(response.status).toEqual(500);
//         expect(response.text).toContain("<div id=\"root\"></div>");
//     });
// });

describe("Unknown API endpoint", () => {
  it("should return a 404 status and not-found message", async () => {
    const response = await request.get("/api/does-not-exist");

    expect(response.statusCode).toEqual(404);
    expect(response.body).toStrictEqual({ message: "Not found" });
  });
});

describe("Client route rendering and global error handler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to the built client folder when cwd is not the repo root", () => {
    const serverDir = path.dirname(fileURLToPath(import.meta.url));
    const expectedBuildRoot = path.resolve(serverDir, "../../build");
    const expectedClientBuildFolder = path.resolve(expectedBuildRoot, "client");
    const expectedErrorPage = path.resolve(serverDir, "views/500.html");

    vi.spyOn(process, "cwd").mockReturnValue("/definitely/not/the/repo");
    vi.spyOn(fs, "existsSync").mockImplementation((candidate) => {
      const resolvedCandidate = String(candidate);

      return [expectedBuildRoot, expectedClientBuildFolder, expectedErrorPage].includes(
        resolvedCandidate,
      );
    });

    const app = newServer(config);

    expect(app.get("views")).toEqual(expectedClientBuildFolder);
  });

  it("renders runtime config as safely escaped json in the html", async () => {
    const app = newServer({
      ...config,
      urlDomain: 'surveys.test</script><script>alert("xss")</script>',
    });

    app.set("views", path.resolve(process.cwd()));

    const response = await supertest(app).get("/runtime-config-check");

    expect(response.statusCode).toEqual(200);
    expect(response.text).toMatch(/<script\s+id="app-config"\s+type="application\/json"\s*>/);
    expect(response.text).toContain('"projectId":"test-project-id"');
    expect(response.text).toContain(
      '"urlDomain":"surveys.test\\u003c/script>\\u003cscript>alert(\\"xss\\")\\u003c/script>"',
    );
    expect(response.text).not.toContain("window.appConfig");
  });

  it("returns the static 500 page when render fails and error page exists", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue("<html>500</html>");
    const app = newServer(config);

    app.set("views", "/definitely/missing/views");

    const response = await supertest(app).get("/some/client/route");

    expect(response.statusCode).not.toEqual(200);
    expect(response.text).not.toEqual("Sorry, there is a problem with the service.");
  });

  it("returns plain text fallback when render fails and no error page exists", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    const app = newServer(config);

    app.set("views", "/definitely/missing/views");

    const response = await supertest(app).get("/another/client/route");

    expect(response.statusCode).toEqual(500);
    expect(response.text).toEqual("Sorry, there is a problem with the service.");
  });
});

describe("Rate limiter authenticated key generator", () => {
  type KeyGeneratorRequest = Parameters<typeof keyGeneratorFromForwardedHeader>[0];

  it("uses the authenticated username when available", () => {
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({ name: "Rich User" }),
    } as unknown as Auth;
    const request = {
      headers: { forwarded: "for=198.51.100.50;proto=https" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromAuthenticatedUser(auth, request as KeyGeneratorRequest)).toBe(
      "user:rich%20user",
    );
  });

  it("falls back to forwarded/IP identity when username is unavailable", () => {
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({}),
    } as unknown as Auth;
    const request = {
      headers: { forwarded: "for=198.51.100.50;proto=https" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromAuthenticatedUser(auth, request as KeyGeneratorRequest)).toBe(
      "198.51.100.50",
    );
  });

  it("falls back to forwarded/IP identity when auth access throws", () => {
    const auth = {
      getToken: vi.fn().mockImplementation(() => {
        throw new Error("token error");
      }),
      getUser: vi.fn(),
    } as unknown as Auth;
    const request = {
      headers: { forwarded: "for=198.51.100.50;proto=https" },
      ip: "10.0.0.2",
      socket: { remoteAddress: "127.0.0.1" },
    };

    expect(keyGeneratorFromAuthenticatedUser(auth, request as KeyGeneratorRequest)).toBe(
      "198.51.100.50",
    );
  });
});

describe("Server error handler", () => {
  beforeEach(async () => {
    vi.resetModules();
    mockGetAuthHeader.mockResolvedValue({
      Authorization: "Bearer token",
    });
    vi.spyOn(BertClient.prototype, "getCallHistoryStatus").mockRejectedValueOnce(new Error("boom"));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  it("returns JSON 500 for API routes when a handler throws", async () => {
    const app = newServer(config);
    const request = supertest(app);

    const response = await request.get("/api/reports/call-history-status");

    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({});
  });
});

// describe("Test call history status endpoint", () => {
//     beforeEach(() => {
//         vi.clearAllMocks();
//         mockGetAuthHeader.mockResolvedValue({ Authorization: "Bearer token" });
//     });

//     afterEach(() => {
//         vi.clearAllMocks();
//     });

//     it("should call BERT and return the status", async () => {
//         const returned = { lastUpdated: "2022-01-01T00:00:00Z" };
//         axiosMock.onGet(`${config.bertUrl}/api/reports/call-history-status`).reply(200, returned);
//         const response = await request.get("/api/reports/call-history-status");
//         //expect(response.status).toEqual(200);
//         expect(response.body).toStrictEqual(returned);
//     });
// });

// describe("Test call history status endpoint", () => {
//     const mockGetCallHistoryStatus = vi
//         .spyOn(BertClient.prototype, "getCallHistoryStatus")
//         .mockResolvedValue({
//             lastUpdated: "2022-01-01T00:00:00Z",
//         });

//     beforeEach(() => {
//         vi.clearAllMocks();
//         mockGetAuthHeader.mockResolvedValue({ Authorization: "Bearer token" });
//     });

//     afterEach(() => {
//         vi.clearAllMocks();
//     });

//     it("should call BERT and return the status", async () => {
//         const returned = { lastUpdated: "2022-01-01T00:00:00Z" };

//         const response = await request.get("/api/reports/call-history-status");

//         // expect(response.status).toBe(200);
//         // expect(response.body).toStrictEqual(returned);

//         expect(mockGetCallHistoryStatus).toHaveBeenCalledTimes(1);
//     });
// });

// describe("Test questionnaires endpoint", () => {
//     it("rejects unsafe interviewer path segment", async () => {
//         const response: supertest.Response = await request.post("/api/questionnaires")
//             .field("interviewer", "bad/path")
//             .field("start_date", "2022-10-01")
//             .field("end_date", "2022-10-31")
//             .field("survey_tla", "NPM");

//         expect(response.status).toEqual(400);
//         expect(response.body).toStrictEqual({ error: "Invalid interviewer" });
//     });

//     it("should return a 200 status and the expected list of questionnaires", async () => {
//         const questionnairesReturned = ["LMS2101_AA1", "LMS2101_BB1", "LMS2101_CC1"];

//         axiosMock.onGet("http://bert.com/api/int_1/questionnaires?start-date=2022-10-01&end-date=2022-10-31&survey-tla=NPM")
//             .reply(200, questionnairesReturned);

//         const response: supertest.Response = await request.post("/api/questionnaires")
//             .field("interviewer", "int_1")
//             .field("start_date", "2022-10-01")
//             .field("end_date", "2022-10-31")
//             .field("survey_tla", "NPM");

//         expect(response.status).toEqual(200);
//         expect(response.body).toEqual(questionnairesReturned);
//     });
// });

// describe("Test appointment resource planning questionnaires endpoint", () => {
//     const questionnairesReturned = ["LMS2101_AA1", "LMS2101_BB1", "LMS2101_CC1"];

//     it("should return a 200 status and the expected list of questionnaires", async () => {
//         axiosMock.onGet("http://bert.com/api/appointment-resource-planning/2022-10-27/questionnaires?survey-tla=NPM")
//             .reply(200, questionnairesReturned);
//         const response: supertest.Response = await request.post("/api/appointments/questionnaires")
//             .field("date", "2022-10-27")
//             .field("survey_tla", "NPM");
//         expect(response.status).toEqual(200);
//         expect(response.body).toEqual(questionnairesReturned);
//     });

//     it("masks passwords in request logging", async () => {

//         const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => { /* noop */ });
//         axiosMock.onGet("http://bert.com/api/appointment-resource-planning/2022-10-27/questionnaires?survey-tla=NPM")
//             .reply(200, questionnairesReturned);

//         const response: supertest.Response = await request.post("/api/appointments/questionnaires")
//             .field("date", "2022-10-27")
//             .field("survey_tla", "NPM")
//             .field("password", "super-secret");

//         expect(response.status).toEqual(200);
//         const loggedObjectCall = consoleSpy.mock.calls.find(([arg]) => typeof arg === "object" && arg !== null && "password" in (arg as object));
//         console.log(consoleSpy.mock.calls);
//         expect(loggedObjectCall?.[0]).toMatchObject({ password: "********" });

//         consoleSpy.mockRestore();

//     });
// });

// describe("Test report endpoints (query construction)", () => {
//     it("builds call history URL including questionnaires CSV", async () => {
//         const returned = [{ interviewer: "int_1" }];
//         axiosMock.onGet("http://bert.com/api/reports/call-history/int_1?start-date=2022-10-01&end-date=2022-10-31&survey-tla=NPM&questionnaires=Q1%2CQ2")
//             .reply(200, returned);

//         const response: supertest.Response = await request.post("/api/reports/interviewer-call-history")
//             .field("interviewer", "int_1")
//             .field("start_date", "2022-10-01")
//             .field("end_date", "2022-10-31")
//             .field("survey_tla", "NPM")
//             .field("questionnaires", "Q1")
//             .field("questionnaires", "Q2");

//         expect(response.status).toEqual(200);
//         expect(response.body).toEqual(returned);
//     });

//     it("builds call pattern URL without questionnaires when not provided", async () => {
//         const returned = [{ interviewer: "int_1" }];
//         axiosMock.onGet("http://bert.com/api/reports/call-pattern/int_1?start-date=2022-10-01&end-date=2022-10-31&survey-tla=NPM")
//             .reply(200, returned);

//         const response: supertest.Response = await request.post("/api/reports/interviewer-call-pattern")
//             .field("interviewer", "int_1")
//             .field("start_date", "2022-10-01")
//             .field("end_date", "2022-10-31")
//             .field("survey_tla", "NPM");

//         expect(response.status).toEqual(200);
//         expect(response.body).toEqual(returned);
//     });

//     it("rejects unsafe interviewer on report endpoints", async () => {
//         const response: supertest.Response = await request.post("/api/reports/interviewer-call-pattern")
//             .field("interviewer", "../oops")
//             .field("start_date", "2022-10-01")
//             .field("end_date", "2022-10-31")
//             .field("survey_tla", "NPM");

//         expect(response.status).toEqual(400);
//         expect(response.body).toStrictEqual({ error: "Invalid interviewer" });
//     });
// });

// describe("Test appointment resource planning report endpoints", () => {
//     it("returns appointment resource planning report data", async () => {
//         const returned = [{ date: "2022-10-27" }];
//         axiosMock.onGet("http://bert.com/api/reports/appointment-resource-planning/2022-10-27?survey-tla=NPM&questionnaires=Q1")
//             .reply(200, returned);

//         const response: supertest.Response = await request.post("/api/reports/appointment-resource-planning")
//             .field("date", "2022-10-27")
//             .field("survey_tla", "NPM")
//             .field("questionnaires", "Q1");

//         expect(response.status).toEqual(200);
//         expect(response.body).toEqual(returned);
//     });

//     it("returns appointment resource planning summary report data", async () => {
//         const returned = [{ total: 123 }];
//         axiosMock.onGet("http://bert.com/api/reports/appointment-resource-planning-summary/2022-10-27?survey-tla=NPM&questionnaires=Q1")
//             .reply(200, returned);

//         const response: supertest.Response = await request.post("/api/reports/appointment-resource-planning-summary")
//             .field("date", "2022-10-27")
//             .field("survey_tla", "NPM")
//             .field("questionnaires", "Q1");

//         expect(response.status).toEqual(200);
//         expect(response.body).toEqual(returned);
//     });
// });
