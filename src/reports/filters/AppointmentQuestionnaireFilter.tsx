import React, { ReactElement, useCallback } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { AuthManager } from "blaise-login-react-client";
import Breadcrumbs from "../../components/Breadcrumbs";
import AppointmentResourceDaybatchWarning from "../AppointmentResourcePlanning/AppointmentResourceDaybatchWarning";
import { formatDate, formatISODate } from "../../utilities/DateFormatter";
import { LoadData } from "../../components/LoadData";
import QuestionnaireSelector from "../../components/QuestionnaireSelector";

interface AppointmentQuestionnaireFilterPageProps {
    reportDate: Date;
    surveyTla: string;
    questionnaires: string[];
    setQuestionnaires: (string: string[]) => void;
    submitFunction: () => void;
    navigateBack: () => void;
}

function axiosConfig(): AxiosRequestConfig {
    const authManager = new AuthManager();
    return {
        headers: authManager.authHeader(),
    };
}

function FetchQuestionnairesError() {
    return (
        <>
            <h2>An error occurred while fetching the list of questionnaires</h2>
            <p>Try again later.</p>
            <p>If you are still experiencing problems <a href="https://ons.service-now.com/">report this
                issue</a> to Service Desk</p>
        </>
    );
}

async function getQuestionnaireList(surveyTla: string, reportDate: Date): Promise<string[]> {
    const url = "/api/appointments/questionnaires";

    const formData = new FormData();
    formData.append("survey_tla", surveyTla);
    formData.append("date", formatISODate(reportDate));

    let response: AxiosResponse<string[] | 0>;

    try {
        response = await axios.post(url, formData, axiosConfig());
    } catch (error) {
        console.error(`Response: Error ${error} - URL: ${url}`);
        throw error;
    }

    console.log(`Response: Status ${response.status}, data ${response.data}`);

    if (response.data === 0) {
        return [];
    }

    if (response.status === 200) {
        return response.data;
    }

    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw "Response was not 200";
}

function AppointmentQuestionnaireFilter({
    navigateBack,
    questionnaires,
    reportDate,
    setQuestionnaires,
    submitFunction,
    surveyTla,
}: AppointmentQuestionnaireFilterPageProps): ReactElement {
    const errorMessage = useCallback(() => <FetchQuestionnairesError />, []);

    return (
        <div>
            <Breadcrumbs
                BreadcrumbList={[{ link: "/", title: "Reports" }, {
                    link: "#",
                    onClickFunction: navigateBack,
                    title: "Appointment Details",
                }]}
            />

            <main id="main-content" className="ons-page__main ons-u-mt-s">
                <h1 className="ons-u-mb-m">Select questionnaires for </h1>
                <h3 className="ons-u-mb-m">
                    Date: { formatDate(reportDate) }
                </h3>
                <AppointmentResourceDaybatchWarning />
                <br />
                <LoadData
                    dataPromise={getQuestionnaireList(surveyTla, reportDate)}
                    errorMessage={errorMessage}
                >
                    { (loadedQuestionnaires) => (
                        <QuestionnaireSelector
                            questionnaires={loadedQuestionnaires}
                            selectedQuestionnaires={questionnaires}
                            setSelectedQuestionnaires={setQuestionnaires}
                            onSubmit={submitFunction}
                        />
                    ) }
                </LoadData>
            </main>
        </div>
    );
}

export default AppointmentQuestionnaireFilter;
