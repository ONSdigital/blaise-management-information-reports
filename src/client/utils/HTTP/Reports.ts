import axios from "axios";

import {
    type AppointmentResourcePlanningReportData,
    type AppointmentResourcePlanningSummaryReportData,
    type CallHistoryStatus,
    type InterviewerCallHistoryReport,
    type InterviewerCallPatternReport,
} from "../../../client/interfaces";
import axiosConfig from "../../api/axiosConfig.js"
import { formatISODate } from "../DateFormatter.js";

import type { AxiosResponse } from "axios";

type ReportFormValue = string | Date | string[] | undefined;

interface ReportForm {
    survey_tla?: ReportFormValue;
    interviewer?: ReportFormValue;
    start_date?: ReportFormValue;
    end_date?: ReportFormValue;
    questionnaires?: ReportFormValue;
}

function appendFormValue(formData: FormData, fieldName: string, fieldValue: ReportFormValue): void {
    formData.append(fieldName, String(fieldValue));
}

async function getQuestionnaireList(
    surveyTla: string,
    interviewer: string,
    startDate: Date,
    endDate: Date,
): Promise<string[]> {
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

    try {
        const response = await axios.get(url, axiosConfig());

        console.log(`Response: Status ${response.status}, data ${JSON.stringify(response.data)}`);

        if (response.status === 200) {
            return response.data;
        }

        return response.data;
    } catch (error: unknown) {
        console.error(`Response: Error ${error}`);

        return undefined;
    }
}

async function getInterviewerCallHistoryReport(
    form: ReportForm,
): Promise<InterviewerCallHistoryReport[]> {
    const url = "/api/reports/interviewer-call-history";
    const formData = new FormData();

    appendFormValue(formData, "survey_tla", form.survey_tla);
    appendFormValue(formData, "interviewer", form.interviewer);
    appendFormValue(formData, "start_date", form.start_date);
    appendFormValue(formData, "end_date", form.end_date);
    appendFormValue(formData, "questionnaires", form.questionnaires);

    function toReport(questionnaire: Record<string, unknown>): InterviewerCallHistoryReport {
        console.log("successful response atleast");
        const report = { ...questionnaire };

        if (!("dial_secs" in report) || report.dial_secs === "") {
            report.dial_secs = 0;
        }

        return report as InterviewerCallHistoryReport;
    }

    try {
        const response: AxiosResponse = await axios.post(url, formData, axiosConfig());

        if (response.status === 200) {
            return response.data.map(toReport);
        }

        throw new Error("Response was not 200");
    } catch (error) {
        console.error(`Response: Error ${error}`);
        throw error;
    }
}

async function getInterviewerCallPatternReport(
    form: ReportForm,
): Promise<InterviewerCallPatternReport | undefined> {
    const url = "/api/reports/interviewer-call-pattern";
    const formData = new FormData();

    appendFormValue(formData, "survey_tla", form.survey_tla);
    appendFormValue(formData, "interviewer", form.interviewer);
    appendFormValue(formData, "start_date", form.start_date);
    appendFormValue(formData, "end_date", form.end_date);
    appendFormValue(formData, "questionnaires", form.questionnaires);

    return axios
        .post(url, formData, axiosConfig())
        .then((response: AxiosResponse) => {
            if (response.status === 200 && Object.keys(response.data).length) {
                console.log(response.data);

                return response.data;
            }

            return undefined;
        })
        .catch((error: Error) => {
            console.error(`Response: Error ${error}`);
            throw error;
        });
}

async function getAppointmentResourcePlanningReport(
    date: Date,
    survey_tla: string,
    questionnaires: string[],
): Promise<AppointmentResourcePlanningReportData[]> {
    const url = "/api/reports/appointment-resource-planning/";
    const formData = new FormData();

    formData.append("date", date.toString());
    formData.append("survey_tla", survey_tla);
    formData.append("questionnaires", questionnaires.join(","));

    return axios
        .post(url, formData, axiosConfig())
        .then((response: AxiosResponse) => {
            console.log(`Response: Status ${response.status}, data ${response.data}`);
            if (response.status === 200) {
                return response.data;
            }

            throw new Error("Response was not 200");
        })
        .catch((error: Error) => {
            console.error(`Response: Error ${error}`);
            throw error;
        });
}

async function getAppointmentResourcePlanningSummaryReport(
    date: Date,
    survey_tla: string,
    questionnaires: string[],
): Promise<AppointmentResourcePlanningSummaryReportData[]> {
    const url = "/api/reports/appointment-resource-planning-summary";
    const formData = new FormData();

    formData.append("date", date.toString());
    formData.append("survey_tla", survey_tla);
    formData.append("questionnaires", questionnaires.join(","));

    return axios
        .post(url, formData, axiosConfig())
        .then((response: AxiosResponse) => {
            console.log(`Response: Status ${response.status}, data ${response.data}`);
            if (response.status === 200) {
                return response.data;
            }

            throw new Error("Response was not 200");
        })
        .catch((error: Error) => {
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
