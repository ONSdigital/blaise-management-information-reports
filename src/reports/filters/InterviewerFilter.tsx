import React, { ReactElement } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import CallHistoryLastUpdatedStatus from "../../components/CallHistoryLastUpdatedStatus";
import SurveyInterviewerStartDateEndDateForm from "../../components/SurveyInterviewerStartDateEndDateForm";

export interface InterviewerFilterQuery {
    interviewer: string;
    startDate: Date;
    endDate: Date;
    surveyTla: string;
}

interface InterviewerFilterPageProps {
    title: string;
    query: InterviewerFilterQuery;
    onSubmit: (search: InterviewerFilterQuery) => void;
}

function InterviewerFilter({
    query: { endDate, interviewer, startDate, surveyTla },
    onSubmit,
    title,
}: InterviewerFilterPageProps): ReactElement {

    async function submitInterviewerFilters(formValues: Record<string, any>, setSubmitting: (isSubmitting: boolean) => void): Promise<void> {
        setSubmitting(true);
        onSubmit({
            interviewer: formValues["Interviewer ID"],
            startDate: new Date(formValues["Start date"]),
            endDate: new Date(formValues["End date"]),
            surveyTla: formValues["Survey TLA"],
        });
    }

    return (
        <>
            <div>
                <Breadcrumbs
                    BreadcrumbList={[{ link: "/", title: "Reports" }]}
                />
                <main id="main-content" className="page__main u-mt-s">
                    <h1 className="u-mb-m">Run interviewer { title } report</h1>
                    <CallHistoryLastUpdatedStatus />
                    <SurveyInterviewerStartDateEndDateForm
                        interviewer={interviewer}
                        surveyTLA={surveyTla}
                        startDate={startDate}
                        endDate={endDate}
                        onSubmit={submitInterviewerFilters}
                    />
                </main>
            </div>
        </>
    );
}

export default InterviewerFilter;
