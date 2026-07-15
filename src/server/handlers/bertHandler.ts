import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";
import { formatISODate } from "../../client/utilities/DateFormatter.js";

import { type BertClient } from "../bertClient.js";

import type AuditLogger from "../auditLogger.js";

const SUPPORTED_DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}(?:.{1}[0-9]{2}:[0-9]{2}:[0-9]{2})?/;

function isSafePathSegment(value: unknown): value is string {
    return typeof value === "string" && /^[A-Za-z0-9_-]+$/.test(value);
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

export default function newBertHandler(
    bertClient: BertClient,
    auth: Auth,
    auditLogger: AuditLogger,
): Router {
    const router = express.Router();

    const bertHandler = new BertHandler(bertClient, auditLogger, auth);

    router.get("/api/reports/call-history-status", auth.middleware, bertHandler.getCallHistoryStatus);

    router.post("/api/questionnaires", auth.middleware, bertHandler.getQuestionnaires);
    router.post("/api/reports/interviewer-call-history", auth.middleware, bertHandler.getInterviewerCallHistoryReport);
    router.post("/api/reports/interviewer-call-pattern", auth.middleware, bertHandler.getInterviewerCallPattern);
    router.post("/api/reports/appointment-resource-planning", auth.middleware, bertHandler.getAppointmentResourcePlanningReport);
    router.post("/api/appointments/questionnaires", auth.middleware, bertHandler.getAppointmentQuestionnaires);
    router.post("/api/reports/appointment-resource-planning-summary", auth.middleware, bertHandler.getAppointmentResourcePlanningSummaryReport);

    return router;
}

class BertHandler {
    private readonly bertClient: BertClient;
    private readonly auditLogger: AuditLogger;
    private readonly auth: Auth;

    constructor(bertClient: BertClient, auditLogger: AuditLogger, auth: Auth) {
        this.bertClient = bertClient;
        this.auditLogger = auditLogger;
        this.auth = auth;
    }

    getCallHistoryStatus = async (req: Request, res: Response): Promise<Response> => {
        try {
            const historyStatus = await this.bertClient.getCallHistoryStatus();

            if (!historyStatus) {
                return res.status(200).json(null);
            }

            return res.status(200).json(historyStatus);
        } catch {
            return res.status(500).json({});
        }
    };

    getQuestionnaires = async (req: Request, res: Response): Promise<Response> => {
        const { interviewer, start_date: startDate, end_date: endDate, survey_tla: surveyTla } = req.body;
        if (!isSafePathSegment(interviewer)) {
            return res.status(400).json({ error: "Invalid interviewer" });
        }
        const startDateFormatted = formatISODate(startDate);
        const endDateFormatted = formatISODate(endDate);
        const query = new URLSearchParams({
            "start-date": startDateFormatted,
            "end-date": endDateFormatted,
            "survey-tla": String(surveyTla ?? ""),
        });
        const url = `/api/${encodeURIComponent(interviewer)}/questionnaires?${query.toString()}`;
        try {

            const result = await this.bertClient.getQuestionnaires(url);

            return res.status(200).json(result);
        } catch {
            return res.status(500).json({});
        }
    };

    getInterviewerCallHistoryReport = async (req: Request, res: Response): Promise<Response> => {

        const { interviewer, start_date: startDate, end_date: endDate, survey_tla: surveyTla, questionnaires } = req.body;
        if (!isSafePathSegment(interviewer)) {
            return res.status(400).json({ error: "Invalid interviewer" });
        }


        const startDateFormatted = formatISODate(startDate);
        const endDateFormatted = formatISODate(endDate);
        const query = new URLSearchParams({
            "start-date": startDateFormatted,
            "end-date": endDateFormatted,
            "survey-tla": String(surveyTla ?? ""),
        });
        const questionnairesValue = toCsvQueryValue(questionnaires);
        if (questionnairesValue.length > 0) {
            query.set("questionnaires", questionnairesValue);
        }
        const url = `/api/reports/call-history/${encodeURIComponent(interviewer)}?${query.toString()}`;
        const response = await this.bertClient.getInterviewerCallHistoryReport(url);
        return res.status(response.status).json(response.data);

    };

    getInterviewerCallPattern = async (req: Request, res: Response): Promise<Response> => {
        const { interviewer, start_date: startDate, end_date: endDate, survey_tla: surveyTla, questionnaires, } = req.body;
        if (!isSafePathSegment(interviewer)) {
            return res.status(400).json({ error: "Invalid interviewer" });
        }
        const startDateFormatted = formatISODate(startDate);
        const endDateFormatted = formatISODate(endDate);
        console.log(`questionnaires ${questionnaires}`);
        const query = new URLSearchParams({
            "start-date": startDateFormatted,
            "end-date": endDateFormatted,
            "survey-tla": String(surveyTla ?? ""),
        });
        const questionnairesValue = toCsvQueryValue(questionnaires);
        if (questionnairesValue.length > 0) {
            query.set("questionnaires", questionnairesValue);
        }
        const url = `/api/reports/call-pattern/${encodeURIComponent(interviewer)}?${query.toString()}`;
        console.log(url);
        const response = await this.bertClient.getInterviewerCallPattern(url);
        return res.status(response.status).json(response.data);
    }

    getAppointmentResourcePlanningReport = async (req: Request, res: Response): Promise<Response> => {

        const { date, survey_tla: surveyTla, questionnaires } = req.body;
        const dateFormatted = formatISODate(date);
        const questionnairesQuery = questionnaires.length > 0 ? `&questionnaires=${questionnaires}` : "";
        const url = `/api/reports/appointment-resource-planning/${dateFormatted}?survey-tla=${surveyTla}${questionnairesQuery}`;
        const response = await this.bertClient.getAppointmentResourcePlanningReport(url);
        return res.status(response.status).json(response.data);
    };

    getAppointmentQuestionnaires = async (req: Request, res: Response): Promise<Response> => {
        const { date, survey_tla: surveyTla } = req.body;
        const dateFormatted = formatISODate(date);
        const url = `/api/appointment-resource-planning/${dateFormatted}/questionnaires?survey-tla=${surveyTla}`;
        const response = await this.bertClient.getAppointmentQuestionnaires(url);
        return res.status(response.status).json(response.data);
    }

    getAppointmentResourcePlanningSummaryReport = async (req: Request, res: Response): Promise<Response> => {
        const { date, survey_tla: surveyTla, questionnaires } = req.body;
        const dateFormatted = formatISODate(date);
        const questionnairesQuery = questionnaires.length > 0 ? `&questionnaires=${questionnaires}` : "";
        const url = `/api/reports/appointment-resource-planning-summary/${dateFormatted}?survey-tla=${surveyTla}${questionnairesQuery}`;
        const response = await this.bertClient.getAppointmentResourcePlanningSummaryReport(url);
        return res.status(response.status).json(response.data);
    }

}

