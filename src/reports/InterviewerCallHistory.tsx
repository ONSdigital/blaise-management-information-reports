import React, {ReactElement, useState} from "react";
import {ErrorBoundary, ONSPanel} from "blaise-design-system-react-components";
import {getInterviewerCallHistoryReport} from "../utilities/HTTP";
import {convertSecondsToMinutesAndSeconds} from "../utilities/Converters";
import {InterviewerCallHistoryReport} from "../interfaces";
import {CSVLink} from "react-csv";
import dateFormatter from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Breadcrumbs from "../components/Breadcrumbs";
import CallHistoryLastUpdatedStatus from "../components/CallHistoryLastUpdatedStatus";
import SurveyInterviewerStartDateEndDateForm from "../components/SurveyInterviewerStartDateEndDateForm";
import ReportErrorPanel from "../components/ReportErrorPanel";

dateFormatter.extend(utc);
dateFormatter.extend(timezone);

function InterviewerCallHistory(): ReactElement {
    const [interviewerID, setInterviewerID] = useState<string>("");
    const [messageNoData, setMessageNoData] = useState<string>("");
    const [reportData, setReportData] = useState<InterviewerCallHistoryReport[]>([]);
    const [reportFailed, setReportFailed] = useState<boolean>(false);
    const reportExportHeaders = [
        {label: "Interviewer", key: "interviewer"},
        {label: "Questionnaire", key: "questionnaire_name"},
        {label: "Serial Number", key: "serial_number"},
        {label: "Call Start Time", key: "call_start_time"},
        {label: "Call Length (Seconds)", key: "dial_secs"},
        {label: "Call Result", key: "call_result"}
    ];


    async function runInterviewerCallHistoryReport(formValues: Record<string, any>, setSubmitting: (isSubmitting: boolean) => void): Promise<void> {
        setMessageNoData("");
        setReportFailed(false);
        setReportData([]);
        setInterviewerID(formValues["Interviewer ID"]);
        formValues.survey_tla = formValues["Survey TLA"];
        formValues.interviewer = formValues["Interviewer ID"];
        formValues.start_date = new Date(formValues["Start date"]);
        formValues.end_date = new Date(formValues["End date"]);
        console.log(formValues);

        let callHistory: InterviewerCallHistoryReport[];
        try {
            callHistory = await getInterviewerCallHistoryReport(formValues);
        } catch {
            setReportFailed(true);
            return;
        } finally {
            setSubmitting(false);
        }

        if (callHistory.length === 0) {
            setMessageNoData("No data found for parameters given.");
            return;
        }

        console.log(callHistory);
        setReportData(callHistory);
        setSubmitting(false);
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={[{link: "/", title: "Back"}]}/>
            <main id="main-content" className="page__main u-mt-s">
                <h1 className="u-mb-m">Run interviewer call history report</h1>
                <ReportErrorPanel error={reportFailed}/>
                <CallHistoryLastUpdatedStatus/>
                <SurveyInterviewerStartDateEndDateForm onSubmitFunction={runInterviewerCallHistoryReport}/>
                <br/>
                <CSVLink hidden={reportData === null || reportData.length === 0}
                         data={reportData}
                         headers={reportExportHeaders}
                         target="_blank"
                         filename={`interviewer-call-history-${interviewerID}.csv`}>
                    Export report as Comma-Separated Values (CSV) file
                </CSVLink>
                <ErrorBoundary errorMessageText={"Failed to load"}>
                    {
                        reportData && reportData.length > 0
                            ?
                            <table id="report-table" className="table u-mt-s">
                                <thead className="table__head u-mt-m">
                                <tr className="table__row">
                                    <th scope="col" className="table__header ">
                                        <span>Questionnaire</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Serial Number</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Call Start Time</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Call Length</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Call Result</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="table__body">
                                {
                                    reportData.map((callHistory: InterviewerCallHistoryReport) => {
                                        return (
                                            <tr className="table__row" key={callHistory.call_start_time}
                                                data-testid={"report-table-row"}>
                                                <td className="table__cell ">
                                                    {callHistory.questionnaire_name}
                                                </td>
                                                <td className="table__cell ">
                                                    {callHistory.serial_number}
                                                </td>
                                                <td className="table__cell ">
                                                    {dateFormatter(callHistory.call_start_time).tz("Europe/London").format("DD/MM/YYYY HH:mm:ss")}
                                                </td>
                                                <td className="table__cell ">
                                                    {convertSecondsToMinutesAndSeconds(callHistory.dial_secs)}
                                                </td>
                                                <td className="table__cell ">
                                                    {(callHistory.call_result === null ? "Unknown" : callHistory.call_result)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                                </tbody>
                            </table>
                            :
                            <ONSPanel hidden={messageNoData === "" && true}>{messageNoData}</ONSPanel>
                    }
                    <br/>
                </ErrorBoundary>
            </main>
        </>
    );
}

export default InterviewerCallHistory;
