import React, { ReactElement } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { CSVLink } from "react-csv";
import { InterviewerCallHistoryReport } from "../../interfaces";
import { getInterviewerCallHistoryReport } from "../../utilities/HTTP";
import CallHistoryLastUpdatedStatus from "../../components/CallHistoryLastUpdatedStatus";
import { formatDateAndTime } from "../../utilities/DateFormatter";
import FilterSummary from "../../components/FilterSummary";
import CallHistoryReportTable from "../../components/CallHistoryReportTable";
import { LoadData } from "../../components/LoadData";
import { InterviewerFilterQuery } from "../filters/InterviewerFilter";

interface RenderInterviewerCallHistoryReportPageProps {
    interviewerFilterQuery: InterviewerFilterQuery,
    questionnaires: string[];
    navigateBack: () => void;
    navigateBackTwoSteps: () => void;
}

function RenderInterviewerCallHistoryReport({
    interviewerFilterQuery,
    navigateBack,
    navigateBackTwoSteps,
    questionnaires
}: RenderInterviewerCallHistoryReportPageProps): ReactElement {

    const reportExportHeaders = [
        { label: "Interviewer", key: "interviewer" },
        { label: "Questionnaire", key: "questionnaire_name" },
        { label: "Serial Number", key: "serial_number" },
        { label: "Call Start Time", key: "call_start_time" },
        { label: "Call Length (Seconds)", key: "dial_secs" },
        { label: "Call Result", key: "call_result" }
    ];

    async function runInterviewerCallHistoryReport(): Promise<InterviewerCallHistoryReport[]> {
        const formValues: Record<string, any> = {};
        formValues.survey_tla = interviewerFilterQuery.surveyTla;
        formValues.interviewer = interviewerFilterQuery.interviewer;
        formValues.start_date = interviewerFilterQuery.startDate;
        formValues.end_date = interviewerFilterQuery.endDate;
        formValues.questionnaires = questionnaires;

        const callHistory = await getInterviewerCallHistoryReport(formValues);
        console.log(callHistory);

        return callHistory;
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={ [
                { link: "/", title: "Reports" },
                { link: "#", onClickFunction: navigateBackTwoSteps, title: "Interviewer details" },
                { link: "#", onClickFunction: navigateBack, title: "Questionnaires" }
            ] }/>
            <main id="main-content" className="page__main u-mt-s">
                <h1>Call History Report</h1>
                <FilterSummary { ...interviewerFilterQuery } questionnaires={questionnaires}/>
                <CallHistoryLastUpdatedStatus/>
                <br/>
                <LoadData
                    dataPromise={ runInterviewerCallHistoryReport() }
                    errorMessage="Failed to load"
                >
                    { (reportData) => (
                        <>
                            <CSVLink
                                hidden={ reportData === null || reportData.length === 0 }
                                data={
                                    reportData?.map(row => (
                                        { ...row, call_start_time: formatDateAndTime(row.call_start_time) }
                                    ))
                                }
                                headers={ reportExportHeaders }
                                target="_blank"
                                filename={ `interviewer-call-history-${ interviewerFilterQuery.interviewer }.csv` }>
                                Export report as Comma-Separated Values (CSV) file
                            </CSVLink>
                            <CallHistoryReportTable
                                messageNoData="No data found for parameters given."
                                reportData={ reportData }/>
                        </>
                    ) }
                </LoadData>
            </main>
        </>
    );
}

export default RenderInterviewerCallHistoryReport;
