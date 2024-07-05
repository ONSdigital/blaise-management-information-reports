import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { AuthManager } from "blaise-login-react/blaise-login-react-client";
import {
    AppointmentResourcePlanningReportData,
    AppointmentResourcePlanningSummaryReportData,
    CallHistoryStatus,
    InterviewerCallHistoryReport,
    InterviewerCallPatternReport,
} from "../../interfaces";
import { formatISODate } from "../DateFormatter";

function axiosConfig(): AxiosRequestConfig {
    const authManager = new AuthManager();
    return {
        headers: authManager.authHeader(),
    };
}

async function getQuestionnaireList(surveyTla: string, interviewer: string, startDate: Date, endDate: Date): Promise<string[]> {
    const url = "/api/questionnaires";

    const formData = new FormData();
    formData.append("survey_tla", surveyTla);
    formData.append("interviewer", interviewer);
    formData.append("start_date", formatISODate(startDate));
    formData.append("end_date", formatISODate(endDate));

    const response = await axios.post(url, formData, axiosConfig());

    console.log(`Response: Status ${response.status}, data ${response.data}`);

    if (response.status !== 200) {
        throw new Error("Response was not 200");
    }

    return response.data;
}

async function getInterviewerCallHistoryStatus(): Promise<CallHistoryStatus | undefined> {
    const url = "/api/reports/call-history-status";

    return axios.get(url, axiosConfig()).then((response: AxiosResponse) => {
        console.log(`Response: Status ${response.status}, data ${JSON.stringify(response.data)}`);
        if (response.status === 200) {
            return response.data;
        }
        return undefined;
    }).catch((error: Error) => {
        console.error(`Response: Error ${error}`);
        return undefined;
    });
}

async function getInterviewerCallHistoryReport(form: Record<string, any>): Promise<InterviewerCallHistoryReport[]> {
    const url = "/api/reports/interviewer-call-history";
    const formData = new FormData();
    formData.append("survey_tla", form.survey_tla);
    formData.append("interviewer", form.interviewer);
    formData.append("start_date", form.start_date);
    formData.append("end_date", form.end_date);
    formData.append("questionnaires", form.questionnaires);

    function toReport(questionnaire: Record<string, unknown>): InterviewerCallHistoryReport {
        const report = { ...questionnaire };
        if (!("dial_secs" in report) || report.dial_secs === "") {
            report.dial_secs = 0;
        }
        return report as InterviewerCallHistoryReport;
    }

    try {
        const response: AxiosResponse = await axios.post(url, formData, axiosConfig());

        console.log(`Response: Status ${response.status}, data ${response.data}`);
        if (response.status === 200) {
            return response.data.map(toReport);
        }
        throw new Error("Response was not 200");
    } catch (error) {
        console.error(`Response: Error ${error}`);
        throw error;
    }
}

async function getInterviewerCallPatternReport(form: Record<string, any>): Promise<InterviewerCallPatternReport | undefined> {
    const url = "/api/reports/interviewer-call-pattern";
    const formData = new FormData();
    formData.append("survey_tla", form.survey_tla);
    formData.append("interviewer", form.interviewer);
    formData.append("start_date", form.start_date);
    formData.append("end_date", form.end_date);
    formData.append("questionnaires", form.questionnaires);

    return axios.post(url, formData, axiosConfig()).then((response: AxiosResponse) => {
        if (response.status === 200 && Object.keys(response.data).length) {
            console.log(response.data);
            return response.data;
        }
        return undefined;
    }).catch((error: Error) => {
        console.error(`Response: Error ${error}`);
        throw error;
    });
}

async function getAppointmentResourcePlanningReport(date: Date, survey_tla: string, questionnaires: string[]): Promise<AppointmentResourcePlanningReportData[]> {
    const url = "/api/reports/appointment-resource-planning/";
    const formData = new FormData();
    formData.append("date", date.toString());
    formData.append("survey_tla", survey_tla);
    formData.append("questionnaires", questionnaires.join(","));

    return axios.post(url, formData, axiosConfig()).then((response: AxiosResponse) => {
        console.log(`Response: Status ${response.status}, data ${response.data}`);
        if (response.status === 200) {
            return response.data;
        }
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "Response was not 200";
    }).catch((error: Error) => {
        console.error(`Response: Error ${error}`);
        throw error;
    });
}

async function getAppointmentResourcePlanningSummaryReport(date: Date, survey_tla: string, questionnaires: string[]): Promise<AppointmentResourcePlanningSummaryReportData[]> {
    const url = "/api/reports/appointment-resource-planning-summary";
    const formData = new FormData();
    formData.append("date", date.toString());
    formData.append("survey_tla", survey_tla);
    formData.append("questionnaires", questionnaires.join(","));

    return axios.post(url, formData, axiosConfig()).then((response: AxiosResponse) => {
        console.log(`Response: Status ${response.status}, data ${response.data}`);
        if (response.status === 200) {
            return response.data;
        }
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw "Response was not 200";
    }).catch((error: Error) => {
        console.error(`Response: Error ${error}`);
        throw error;
    });
}

export {
    getQuestionnaireList,
    getInterviewerCallHistoryStatus,
    getInterviewerCallHistoryReport,
    getInterviewerCallPatternReport,
    getAppointmentResourcePlanningReport,
    getAppointmentResourcePlanningSummaryReport,
};
