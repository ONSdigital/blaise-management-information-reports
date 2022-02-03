import express, { NextFunction, Request, Response, Express } from "express";
import path from "path";
import ejs from "ejs";
import createLogger from "./pino";
import { SendAPIRequest } from "./SendRequest";
import multer from "multer";
import dateFormatter from "dayjs";
import BlaiseIapNodeProvider from "blaise-iap-node-provider";
import BlaiseApiClient from "blaise-api-node-client";
import { newLoginHandler } from "blaise-login-react-server";
import { Config } from "./Config";
import { Auth } from "blaise-login-react-server";
import PinoHttp from "pino-http";

class RequestLogger {
    logger: PinoHttp.HttpLogger

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

export function newServer(config: Config, authProvider: BlaiseIapNodeProvider, blaiseApiClient: BlaiseApiClient): Express {
    const upload = multer();
    const server = express();
    const logger = createLogger();
    const requestLogger = new RequestLogger(logger);
    server.use(logger);
    server.use(upload.any());

    const auth = new Auth(config);
    const loginHandler = newLoginHandler(auth, blaiseApiClient);

    // where ever the react built package is
    const buildFolder = "../build";

    // treat the index.html as a template and substitute the values at runtime
    server.set("views", path.join(__dirname, buildFolder));
    server.engine("html", ejs.renderFile);
    server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));
    server.use(requestLogger.logRequest);

    // health_check endpoint
    server.get("/mir-ui/:version/health", async function (req: Request, res: Response) {
        console.log("health_check endpoint called");
        res.status(200).json({ healthy: true });
    });

    // call-history-status endpoint
    server.get("/api/reports/call-history-status", auth.Middleware, async function (req: Request, res: Response) {
        console.log("call-history-status endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const url = `${config.BertUrl}/api/reports/call-history-status`;
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    // interviewer-call-history report endpoint
    server.post("/api/reports/interviewer-call-history", auth.Middleware, async function (req: Request, res: Response) {
        console.log("interviewer-call-history endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const { interviewer, start_date, end_date, survey_tla } = req.body;
        const startDateFormatted = dateFormatter(start_date).format("YYYY-MM-DD");
        const endDateFormatted = dateFormatter(end_date).format("YYYY-MM-DD");
        const url = `${config.BertUrl}/api/reports/call-history/${interviewer}?start-date=${startDateFormatted}&end-date=${endDateFormatted}&survey-tla=${survey_tla}`;
        console.log(url);
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    // interviewer-call-pattern report endpoint
    server.post("/api/reports/interviewer-call-pattern", auth.Middleware, async function (req: Request, res: Response) {
        console.log("interviewer-call-pattern endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const { interviewer, start_date, end_date, survey_tla } = req.body;
        const startDateFormatted = dateFormatter(start_date).format("YYYY-MM-DD");
        const endDateFormatted = dateFormatter(end_date).format("YYYY-MM-DD");
        const url = `${config.BertUrl}/api/reports/call-pattern/${interviewer}?start-date=${startDateFormatted}&end-date=${endDateFormatted}&survey-tla=${survey_tla}`;
        console.log(url);
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    // appointment-resource-planning report endpoint
    server.post("/api/reports/appointment-resource-planning", auth.Middleware, async function (req: Request, res: Response) {
        console.log("appointment-resource-planning endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const { date } = req.body;
        const dateFormatted = dateFormatter(date).format("YYYY-MM-DD");
        const url = `${config.BertUrl}/api/reports/appointment-resource-planning/${dateFormatted}`;
        console.log(url);
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    // appointment-resource-planning-summary report endpoint
    server.post("/api/reports/appointment-resource-planning-summary", auth.Middleware, async function (req: Request, res: Response) {
        console.log("appointment-resource-planning-summary endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const { date } = req.body;
        const dateFormatted = dateFormatter(date).format("YYYY-MM-DD");
        const url = `${config.BertUrl}/api/reports/appointment-resource-planning-summary/${dateFormatted}`;
        console.log(url);
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    server.use("/", loginHandler);

    server.get("*", function (req: Request, res: Response) {
        res.render("index.html");
    });

    server.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
        logger(req, res);
        req.log.error(err, err.message);
        res.render("../views/500.html", {});
    });

    return server;
}
