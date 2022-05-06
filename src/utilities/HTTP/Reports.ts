import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {AuthManager} from "blaise-login-react-client";
import {
    AppointmentResourcePlanningReportData,
    AppointmentResourcePlanningSummaryReportData,
    CallHistoryStatus,
    InterviewerCallHistoryReport,
    InterviewerCallPatternReport
} from "../../interfaces";

function axiosConfig(): AxiosRequestConfig {
    const authManager = new AuthManager();
    return {
        headers: authManager.authHeader()
    };
}

async function getInterviewerCallHistoryStatus(): Promise<CallHistoryStatus | undefined> {
    const url = "/api/reports/call-history-status";

    return axios.get(url, axiosConfig()).then((response: AxiosResponse) => {
        console.log(`Response: Status ${response.status}, data ${response.data}`);
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
    formData.append("instruments", form.instruments);

    return axios.post(url, formData, axiosConfig()).then((response: AxiosResponse) => {
        console.log(`Response: Status ${response.status}, data ${response.data}`);
        if (response.status === 200) {
            return response.data;
        }
        throw ("Response was not 200");
    }).catch((error: Error) => {
        console.error(`Response: Error ${error}`);
        throw error;
    });
}

async function getInterviewerCallPatternReport(form: Record<string, any>): Promise<InterviewerCallPatternReport | undefined> {
    const url = "/api/reports/interviewer-call-pattern";
    const formData = new FormData();
    formData.append("survey_tla", form.survey_tla);
    formData.append("interviewer", form.interviewer);
    formData.append("start_date", form.start_date);
    formData.append("end_date", form.end_date);
    formData.append("instruments", form.instruments);

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

async function getAppointmentResourcePlanningReport(date: string, survey_tla: string): Promise<AppointmentResourcePlanningReportData[]> {
    const url = "/api/reports/appointment-resource-planning";
    const formData = new FormData();
    formData.append("date", date);
    formData.append("survey_tla", survey_tla);

    return axios.post(url, formData, axiosConfig()).then((response: AxiosResponse) => {
        console.log(`Response: Status ${response.status}, data ${response.data}`);
        if (response.status === 200) {
            return response.data;
        }
        throw "Response was not 200";
    }).catch((error: Error) => {
        console.error(`Response: Error ${error}`);
        throw error;
    });
}

async function getAppointmentResourcePlanningSummaryReport(date: string, survey_tla: string): Promise<AppointmentResourcePlanningSummaryReportData[]> {
    const url = "/api/reports/appointment-resource-planning-summary";
    const formData = new FormData();
    formData.append("date", date);
    formData.append("survey_tla", survey_tla);

    return axios.post(url, formData, axiosConfig()).then((response: AxiosResponse) => {
        console.log(`Response: Status ${response.status}, data ${response.data}`);
        if (response.status === 200) {
            return response.data;
        }
        throw "Response was not 200";
    }).catch((error: Error) => {
        console.error(`Response: Error ${error}`);
        throw error;
    });
}

export {
    getInterviewerCallHistoryStatus,
    getInterviewerCallHistoryReport,
    getInterviewerCallPatternReport,
    getAppointmentResourcePlanningReport,
    getAppointmentResourcePlanningSummaryReport
};
