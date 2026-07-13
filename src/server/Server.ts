import path from "path";
import fs from "fs";
import express, { type Router } from "express";
import type { NextFunction, Request, Response, Express } from "express";
import ejs from "ejs";
import multer from "multer";
import { IapProvider } from "blaise-iap-node-provider";
import { BlaiseApiClient } from "blaise-api-node-client";
import { newLoginHandler, Auth } from "blaise-login-react-server";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type * as PinoHttp from "pino-http";
import type { Config } from "./Config.js";
import SendAPIRequest from "./SendRequest/index.js";
import createLogger from "./pino/index.js";
import helmet from "helmet";
import { formatISODate } from "../client/utilities/DateFormatter.js";
import newHealthCheckHandler from "./handlers/healthCheckHandler.js";
import { fileURLToPath } from "url";
import { type HttpLogger } from "pino-http";
import { BertClient } from "./bertClient.js";
import newBertHandler from "./handlers/bertHandler.js";
import AuditLogger from "./auditLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_API_RATE_LIMIT = 3000;
const DEFAULT_PAGE_RATE_LIMIT = 1000;

interface ClientBuildPaths {
    buildRoot: string;
    clientBuildFolder: string;
}

interface ServerDependencies {
    blaiseApiClient: BlaiseApiClient;
    auth: Auth;
    bertClient: BertClient;
    auditLogger: AuditLogger;
}

interface ServerHandlers {
    loginHandler: Router;
    bertHandler: Router;
}

function parseRateLimit(envName: string, fallback: number): number {
    const value = process.env[envName];

    if (value == null || value.trim() === "") {
        return fallback;
    }

    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }

    return parsed;
}

function toCsvQueryValue(value: unknown): string {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item))
            .filter((item) => item.length > 0)
            .join(",");
    }
    if (typeof value === "string") {
        return value;
    }
    return "";
}

class RequestLogger {
    logger: PinoHttp.HttpLogger;

    constructor(logger: PinoHttp.HttpLogger) {
        this.logger = logger;
        this.logRequest = this.logRequest.bind(this);
    }

    async logRequest(request: Request, response: Response, next: NextFunction): Promise<void> {
        this.logger(request, response);
        if (request.method === "POST") {
            const requestBody = { ...request.body };
            if (requestBody?.password) {
                requestBody.password = "********";
            }
            console.log(requestBody);
        }
        next();
    }
}

// eslint-disable-next-line import/prefer-default-export
export function newServer(config: Config): Express {
    // const upload = multer();
    // const server = express();
    // const logger = createLogger();

    // server.use(upload.any());

    const dependencies = createServerDependencies(config);
    const handlers = createServerHandlers(config, dependencies);
    const apiRateLimiter = createApiRateLimiter(dependencies.auth);

    // const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
    // const auth = new Auth(config);
    const server = express();
    const logger = createLogger();
    const requestLogger = new RequestLogger(logger);
    server.use(logger);
    server.set("trust proxy", 1);
    server.disable("x-powered-by");
    server.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                    "connect-src": ["'self'", "https://storage.googleapis.com"],
                    "img-src": ["'self'", "data:", "https://cdn.ons.gov.uk"],
                },
            },
            crossOriginEmbedderPolicy: false,
        }),
    );

    server.use("/", newHealthCheckHandler());

    server.use("/", handlers.loginHandler);
    server.use(express.json({ limit: "100kb" }));
    server.use("/api", apiRateLimiter);

    const { buildRoot, clientBuildFolder } = resolveClientBuildPaths();
    const errorPageContent = loadErrorPageContent(buildRoot);

    configureClientRendering(server, clientBuildFolder);
    registerRouteHandlers(server, [
        handlers.bertHandler,
    ]);
    // health_check endpoint


    // call-history-status endpoint
    //    DONE server.get("/api/reports/call-history-status", dependencies.auth.middleware, async (req: Request, res: Response) => {
    //         console.log("call-history-status endpoint called");
    //         const authHeader = await authProvider.getAuthHeader();
    //         const url = `${config.bertUrl}/api/reports/call-history-status`;
    //         const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
    //         res.status(status).json(result);
    //     });

    // DONE questionnaire endpoint
    // server.post("/api/questionnaires", dependencies.auth.middleware, async (req: Request, res: Response) => {
    //     console.log("questionnaire endpoint called");
    //     const {
    //         interviewer, start_date: startDate, end_date: endDate, survey_tla: surveyTla,
    //     } = req.body;
    //     const startDateFormatted = formatISODate(startDate);
    //     const endDateFormatted = formatISODate(endDate);
    //     const query = new URLSearchParams({
    //         "start-date": startDateFormatted,
    //         "end-date": endDateFormatted,
    //         "survey-tla": String(surveyTla ?? ""),
    //     });
    //     const url = `${config.bertUrl}/api/${encodeURIComponent(interviewer)}/questionnaires?${query.toString()}`;
    //     console.log(url);
    //     const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null);
    //     res.status(status).json(result);
    // });

    // interviewer-call-history report endpoint
    // server.post("/api/reports/interviewer-call-history", dependencies.auth.middleware, async (req: Request, res: Response) => {
    //     console.log("interviewer-call-history endpoint called");
    //     const authHeader = await authProvider.getAuthHeader();
    //     const {
    //         interviewer, start_date: startDate, end_date: endDate, survey_tla: surveyTla, questionnaires,
    //     } = req.body;
    //     if (!isSafePathSegment(interviewer)) {
    //         res.status(400).json({ error: "Invalid interviewer" });
    //         return;
    //     }
    //     const startDateFormatted = formatISODate(startDate);
    //     const endDateFormatted = formatISODate(endDate);
    //     console.log(`questionnaires ${questionnaires}`);
    //     const query = new URLSearchParams({
    //         "start-date": startDateFormatted,
    //         "end-date": endDateFormatted,
    //         "survey-tla": String(surveyTla ?? ""),
    //     });
    //     const questionnairesValue = toCsvQueryValue(questionnaires);
    //     if (questionnairesValue.length > 0) {
    //         query.set("questionnaires", questionnairesValue);
    //     }
    //     const url = `${config.bertUrl}/api/reports/call-history/${encodeURIComponent(interviewer)}?${query.toString()}`;
    //     console.log(url);
    //     const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
    //     res.status(status).json(result);
    // });

    // interviewer-call-pattern report endpoint
    // server.post("/api/reports/interviewer-call-pattern", dependencies.auth.middleware, async (req: Request, res: Response) => {
    //     console.log("interviewer-call-pattern endpoint called");
    //     const authHeader = await authProvider.getAuthHeader();
    //     const {
    //         interviewer, start_date: startDate, end_date: endDate, survey_tla: surveyTla, questionnaires,
    //     } = req.body;
    //     if (!isSafePathSegment(interviewer)) {
    //         res.status(400).json({ error: "Invalid interviewer" });
    //         return;
    //     }
    //     const startDateFormatted = formatISODate(startDate);
    //     const endDateFormatted = formatISODate(endDate);
    //     console.log(`questionnaires ${questionnaires}`);
    //     const query = new URLSearchParams({
    //         "start-date": startDateFormatted,
    //         "end-date": endDateFormatted,
    //         "survey-tla": String(surveyTla ?? ""),
    //     });
    //     const questionnairesValue = toCsvQueryValue(questionnaires);
    //     if (questionnairesValue.length > 0) {
    //         query.set("questionnaires", questionnairesValue);
    //     }
    //     const url = `${config.bertUrl}/api/reports/call-pattern/${encodeURIComponent(interviewer)}?${query.toString()}`;
    //     console.log(url);
    //     const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
    //     res.status(status).json(result);
    // });

    // appointment-resource-planning report endpoint
    // server.post("/api/reports/appointment-resource-planning", dependencies.auth.middleware, async (req: Request, res: Response) => {
    //     console.log("appointment-resource-planning endpoint called");
    //     const authHeader = await authProvider.getAuthHeader();
    //     const { date, survey_tla: surveyTla, questionnaires } = req.body;
    //     const dateFormatted = formatISODate(date);
    //     const questionnairesQuery = questionnaires.length > 0 ? `&questionnaires=${questionnaires}` : "";
    //     const url = `${config.bertUrl}/api/reports/appointment-resource-planning/${dateFormatted}?survey-tla=${surveyTla}${questionnairesQuery}`;
    //     console.log(url);
    //     const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
    //     res.status(status).json(result);
    // });

    // appointment-resource-planning-questionnaires endpoint
    // server.post("/api/appointments/questionnaires", dependencies.auth.middleware, async (req: Request, res: Response) => {
    //     console.log("appointment-resource-planning-questionnaires endpoint called");
    //     const authHeader = await authProvider.getAuthHeader();
    //     const { date, survey_tla: surveyTla } = req.body;
    //     const dateFormatted = formatISODate(date);
    //     console.log(`dateFormatted is : ${dateFormatted}`);
    //     const url = `${config.bertUrl}/api/appointment-resource-planning/${dateFormatted}/questionnaires?survey-tla=${surveyTla}`;
    //     console.log(url);
    //     const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
    //     res.status(status).json(result);
    // });

    // appointment-resource-planning-summary report endpoint
    // server.post("/api/reports/appointment-resource-planning-summary", dependencies.auth.middleware, async (req: Request, res: Response) => {
    //     console.log("appointment-resource-planning-summary endpoint called");
    //     const authHeader = await authProvider.getAuthHeader();
    //     const { date, survey_tla: surveyTla, questionnaires } = req.body;
    //     const dateFormatted = formatISODate(date);
    //     const questionnairesQuery = questionnaires.length > 0 ? `&questionnaires=${questionnaires}` : "";
    //     const url = `${config.bertUrl}/api/reports/appointment-resource-planning-summary/${dateFormatted}?survey-tla=${surveyTla}${questionnairesQuery}`;
    //     console.log(url);
    //     const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
    //     res.status(status).json(result);
    // });


    server.use("/api", function (_req: Request, res: Response) {
        res.status(404).json({ message: "Not found" });
    });

    server.get(/.*/, pageRateLimiter, function (req: Request, res: Response) {
        res.render("index.html", {
            appConfigJson: getRuntimeConfigJson(config),
        });
    });

    server.use(function (err: Error, req: Request, res: Response, _next: NextFunction) {
        req.log.error(err, err.message);

        if (errorPageContent != null) {
            res.status(500).type("text/html").send(errorPageContent);

            return;
        }

        res.status(500).type("text/plain").send("Sorry, there is a problem with the service.");
    });

    return server;
}

function firstExistingPath(candidates: string[]): string | undefined {
    return candidates.find((candidate) => fs.existsSync(candidate));
}

function resolveClientBuildPaths(): ClientBuildPaths {
    const buildRootCandidates = [
        path.resolve(process.cwd(), "build"),
        path.resolve(__dirname, "../../build"),
    ];
    const buildRoot = firstExistingPath(buildRootCandidates) ?? buildRootCandidates[0];
    const clientBuildCandidates = [path.resolve(buildRoot, "client"), buildRoot];
    const clientBuildFolder = firstExistingPath(clientBuildCandidates) ?? clientBuildCandidates[0];

    return { buildRoot, clientBuildFolder };
}

function configureClientRendering(server: Express, clientBuildFolder: string): void {
    server.set("views", clientBuildFolder);
    server.engine("html", ejs.renderFile);
    server.use("/assets", express.static(path.join(clientBuildFolder, "assets")));
    server.use("/static", express.static(path.join(clientBuildFolder, "static")));
}

function loadErrorPageContent(buildRoot: string): string | undefined {
    const errorPageCandidates = [
        path.resolve(__dirname, "../../src/server/views/500.html"),
        path.resolve(buildRoot, "500.html"),
        path.resolve(buildRoot, "views/500.html"),
    ];
    const errorPagePath = firstExistingPath(errorPageCandidates);

    return errorPagePath ? fs.readFileSync(errorPagePath, "utf-8") : undefined;
}

function createServerDependencies(config: Config): ServerDependencies {
    return {
        blaiseApiClient: new BlaiseApiClient(config.blaiseApiUrl, { timeoutInMs: 5 * 60 * 1_000 }),
        auth: new Auth(config),
        bertClient: new BertClient(config.bertClientId, config.bertUrl),
        auditLogger: new AuditLogger(config.projectId),
    };
}

function createServerHandlers(config: Config, dependencies: ServerDependencies): ServerHandlers {
    const { blaiseApiClient, auth, bertClient, auditLogger } =
        dependencies;

    return {
        loginHandler: newLoginHandler(auth, blaiseApiClient),
        bertHandler: newBertHandler(bertClient, auth, auditLogger),
    };
}

function userRateLimitKey(auth: Auth, req: Request): string | null {
    try {
        const token = auth.getToken(req);
        const userName = auth.getUser(token)?.name;

        if (typeof userName !== "string") {
            return null;
        }

        const normalisedUserName = userName.trim().toLowerCase();

        if (normalisedUserName === "") {
            return null;
        }

        return `user:${encodeURIComponent(normalisedUserName)}`;
    } catch {
        return null;
    }
}

function normaliseForwardedForValue(forwardedForValue: string): string | null {
    const trimmedValue = forwardedForValue.trim().replace(/^"|"$/g, "");

    if (!trimmedValue || trimmedValue.toLowerCase() === "unknown") {
        return null;
    }

    if (trimmedValue.startsWith("[")) {
        const closingBracketIndex = trimmedValue.indexOf("]");

        return closingBracketIndex > 1 ? trimmedValue.slice(1, closingBracketIndex) : null;
    }

    const parts = trimmedValue.split(":");

    if (parts.length === 2 && trimmedValue.includes(".")) {
        return parts[0];
    }

    return trimmedValue;
}

function forwardedHeaderForValue(forwardedHeaderValue: string): string | null {
    for (const entry of forwardedHeaderValue.split(",")) {
        for (const parameter of entry.split(";")) {
            const [parameterName, parameterValue] = parameter.split("=");

            if (parameterName?.trim().toLowerCase() !== "for" || !parameterValue) {
                continue;
            }

            const normalisedValue = normaliseForwardedForValue(parameterValue);

            if (normalisedValue) {
                return normalisedValue;
            }
        }
    }

    return null;
}

export function keyGeneratorFromForwardedHeader(req: Request): string {
    const forwardedHeaderValue = req.headers.forwarded;
    const combinedHeaderValue = Array.isArray(forwardedHeaderValue)
        ? forwardedHeaderValue.join(",")
        : forwardedHeaderValue;

    const forwardedFor = combinedHeaderValue ? forwardedHeaderForValue(combinedHeaderValue) : null;

    return ipKeyGenerator(forwardedFor ?? req.ip ?? req.socket.remoteAddress ?? "unknown");
}

export function keyGeneratorFromAuthenticatedUser(auth: Auth, req: Request): string {
    return userRateLimitKey(auth, req) ?? keyGeneratorFromForwardedHeader(req);
}

function createApiRateLimiter(auth: Auth) {
    return rateLimit({
        windowMs: 5 * 60 * 1000,
        limit: parseRateLimit("DQS_API_RATE_LIMIT", DEFAULT_API_RATE_LIMIT),
        standardHeaders: "draft-8",
        legacyHeaders: false,
        keyGenerator: (req: Request) => keyGeneratorFromAuthenticatedUser(auth, req),
        message: { error: "Too many requests, please try again later" },
    });
}

const pageRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: parseRateLimit("DQS_PAGE_RATE_LIMIT", DEFAULT_PAGE_RATE_LIMIT),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: keyGeneratorFromForwardedHeader,
    message: { error: "Too many requests, please try again later" },
});

function registerRouteHandlers(server: Express, handlers: Router[]): void {
    handlers.forEach((handler) => {
        server.use("/", handler);
    });
}

function getRuntimeConfigJson(config: Config): string {
    return JSON.stringify({
        projectId: config.projectId,
        urlDomain: config.urlDomain,
    }).replace(/</g, "\\u003c");
}