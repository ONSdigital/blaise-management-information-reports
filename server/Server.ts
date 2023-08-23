import path from "path";
import express, {
    NextFunction, Request, Response, Express,
} from "express";
import ejs from "ejs";
import multer from "multer";
import BlaiseIapNodeProvider from "blaise-iap-node-provider";
import BlaiseApiClient from "blaise-api-node-client";
import { newLoginHandler, Auth } from "blaise-login-react-server";
import PinoHttp from "pino-http";
import { Config } from "./Config";
import SendAPIRequest from "./SendRequest";
import createLogger from "./pino";
import { formatISODate } from "../src/utilities/DateFormatter";

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
export function newServer(config: Config, authProvider: BlaiseIapNodeProvider, auth: Auth, blaiseApiClient: BlaiseApiClient): Express {
    const upload = multer();
    const server = express();
    const logger = createLogger();
    const requestLogger = new RequestLogger(logger);
    server.use(logger);
    server.use(upload.any());

    const loginHandler = newLoginHandler(auth, blaiseApiClient);

    // where ever the react built package is
    const buildFolder = "../../build";

    // treat the index.html as a template and substitute the values at runtime
    server.set("views", path.join(__dirname, buildFolder));
    server.engine("html", ejs.renderFile);
    server.use("/static", express.static(path.join(__dirname, `${buildFolder}/static`)));
    server.use(requestLogger.logRequest);

    // health_check endpoint
    server.get("/mir-ui/:version/health", async (req: Request, res: Response) => {
        console.log("health_check endpoint called");
        res.status(200).json({ healthy: true });
    });

    // call-history-status endpoint
    server.get("/api/reports/call-history-status", auth.Middleware, async (req: Request, res: Response) => {
        console.log("call-history-status endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const url = `${config.BertUrl}/api/reports/call-history-status`;
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    // questionnaire endpoint
    server.post("/api/questionnaires", auth.Middleware, async (req: Request, res: Response) => {
        console.log("questionnaire endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const {
            interviewer, start_date: startDate, end_date: endDate, survey_tla: surveyTla,
        } = req.body;
        const startDateFormatted = formatISODate(startDate);
        const endDateFormatted = formatISODate(endDate);
        const url = `${config.BertUrl}/api/${interviewer}/questionnaires?start-date=${startDateFormatted}&end-date=${endDateFormatted}&survey-tla=${surveyTla}`;
        console.log(url);
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    // interviewer-call-history report endpoint
    server.post("/api/reports/interviewer-call-history", auth.Middleware, async (req: Request, res: Response) => {
        console.log("interviewer-call-history endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const {
            interviewer, start_date: startDate, end_date: endDate, survey_tla: surveyTla, questionnaires,
        } = req.body;
        const startDateFormatted = formatISODate(startDate);
        const endDateFormatted = formatISODate(endDate);
        console.log(`questionnaires ${questionnaires}`);
        const questionnairesQuery = questionnaires.length > 0 ? `&questionnaires=${questionnaires}` : "";
        const url = `${config.BertUrl}/api/reports/call-history/${interviewer}?start-date=${startDateFormatted}&end-date=${endDateFormatted}&survey-tla=${surveyTla}${questionnairesQuery}`;
        console.log(url);
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    // interviewer-call-pattern report endpoint
    server.post("/api/reports/interviewer-call-pattern", auth.Middleware, async (req: Request, res: Response) => {
        console.log("interviewer-call-pattern endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const {
            interviewer, start_date: startDate, end_date: endDate, survey_tla: surveyTla, questionnaires,
        } = req.body;
        const startDateFormatted = formatISODate(startDate);
        const endDateFormatted = formatISODate(endDate);
        console.log(`questionnaires ${questionnaires}`);
        const questionnairesQuery = questionnaires.length > 0 ? `&questionnaires=${questionnaires}` : "";
        const url = `${config.BertUrl}/api/reports/call-pattern/${interviewer}?start-date=${startDateFormatted}&end-date=${endDateFormatted}&survey-tla=${surveyTla}${questionnairesQuery}`;
        console.log(url);
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    // appointment-resource-planning report endpoint
    server.post("/api/reports/appointment-resource-planning", auth.Middleware, async (req: Request, res: Response) => {
        console.log("appointment-resource-planning endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const { date, survey_tla: surveyTla, questionnaires } = req.body;
        const dateFormatted = formatISODate(date);
        const questionnairesQuery = questionnaires.length > 0 ? `&questionnaires=${questionnaires}` : "";
        const url = `${config.BertUrl}/api/reports/appointment-resource-planning/${dateFormatted}?survey-tla=${surveyTla}${questionnairesQuery}`;
        console.log(url);
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    // appointment-resource-planning-questionnaires endpoint
    server.post("/api/appointments/questionnaires", auth.Middleware, async (req: Request, res: Response) => {
        console.log("appointment-resource-planning-questionnaires endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const { date, survey_tla: surveyTla } = req.body;
        const dateFormatted = formatISODate(date);
        console.log(`dateFormatted is : ${dateFormatted}`);
        const url = `${config.BertUrl}/api/appointment-resource-planning/${dateFormatted}/questionnaires?survey-tla=${surveyTla}`;
        console.log(url);
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    // appointment-resource-planning-summary report endpoint
    server.post("/api/reports/appointment-resource-planning-summary", auth.Middleware, async (req: Request, res: Response) => {
        console.log("appointment-resource-planning-summary endpoint called");
        const authHeader = await authProvider.getAuthHeader();
        const { date, survey_tla: surveyTla, questionnaires } = req.body;
        const dateFormatted = formatISODate(date);
        const questionnairesQuery = questionnaires.length > 0 ? `&questionnaires=${questionnaires}` : "";
        const url = `${config.BertUrl}/api/reports/appointment-resource-planning-summary/${dateFormatted}?survey-tla=${surveyTla}${questionnairesQuery}`;
        console.log(url);
        const [status, result] = await SendAPIRequest(logger, req, res, url, "GET", null, authHeader);
        res.status(status).json(result);
    });

    server.use("/", loginHandler);

    server.get("*", (req: Request, res: Response) => {
        res.render("index.html");
    });

    server.use((err: Error, req: Request, res: Response) => {
        logger(req, res);
        req.log.error(err, err.message);
        res.render("../../views/500.html", {});
    });

    return server;
}
