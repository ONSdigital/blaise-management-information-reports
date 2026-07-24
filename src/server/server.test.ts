import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Auth } from "blaise-login-react-server";
import dateFormatter from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import supertest from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BertClient } from "./helpers/bertClient.js";
import { loadConfigFromEnv } from "./helpers/config.js";
import {
  keyGeneratorFromAuthenticatedUser,
  type keyGeneratorFromForwardedHeader,
  newServer,
} from "./server.js";

Auth.prototype.validateToken = vi.fn().mockReturnValue(true);

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
  const { mockLoginReactServerModule } = await import("./test-utils/loginReactServer.mock.js");

  return mockLoginReactServerModule();
});

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

// Set up build directory and test files BEFORE creating the server
const buildDir = path.resolve(process.cwd(), "build");
const staticCssDir = path.join(buildDir, "static", "css");

fs.mkdirSync(staticCssDir, { recursive: true });
try {
  fs.writeFileSync(
    path.join(buildDir, "index.html"),
    '<!doctype html><html><body><div id="root"></div></body></html>',
    { flag: "wx" },
  );
} catch {
  // file already exists
}

const testCssPath = path.join(staticCssDir, "__jest_test__.css");

try {
  fs.writeFileSync(testCssPath, ".elementToFadeIn{animation:fadein .3s}\n", { flag: "wx" });
} catch {
  // file already exists
}

const config = loadConfigFromEnv();
const request = supertest(newServer(config));

dateFormatter.extend(customParseFormat);
dateFormatter.extend(utc);
dateFormatter.extend(timezone);

describe("Test Endpoint health", () => {
  it("should return a 200 status and json message", async () => {
    const response: supertest.Response = await request.get("/mir-ui/version/health");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({ healthy: true });
  });
});

describe("Static + catch-all routes", () => {
  it("serves built static assets", async () => {
    const response: supertest.Response = await request.get("/static/css/__jest_test__.css");

    expect(response.status).toEqual(200);
    expect(response.text).toContain(".elementToFadeIn");
  });

  it("renders index.html for non-API routes", async () => {
    const response = await request.get("/some-non-api-route");

    expect(response.status).toEqual(200);
    expect(response.text).toContain('<div id="root"></div>');
  });

  it("returns 500 error page when rendering fails due to non-existent directory", async () => {
    const app = newServer(config);

    app.set("views", "/definitely/missing/views");

    const response = await supertest(app).get("/some/client/route");

    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, there is a problem with the service");
  });
});

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
