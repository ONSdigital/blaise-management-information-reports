// Display interviewer details at top of page
// Sort out breadcrumbs

import React, {useEffect, useState} from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import {CSVLink} from "react-csv";
import {ErrorBoundary, ONSPanel} from "blaise-design-system-react-components";
import {InterviewerCallHistoryReport} from "../interfaces";
import dateFormatter from "dayjs";
import {convertSecondsToMinutesAndSeconds} from "../utilities/Converters";
import {getInterviewerCallHistoryReport} from "../utilities/HTTP";

interface RenderReportPageProps {
    interviewer: string
    startDate: Date
    endDate: Date
    surveyTla: string
    instruments: string[]
}

function RenderReport(props: RenderReportPageProps) {
    const [reportData, setReportData] = useState<InterviewerCallHistoryReport[]>([]);
    const [interviewerID, setInterviewerID] = useState<string>("");
    const [messageNoData, setMessageNoData] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const reportExportHeaders = [
        {label: "Interviewer", key: "interviewer"},
        {label: "Questionnaire", key: "questionnaire_name"},
        {label: "Serial Number", key: "serial_number"},
        {label: "Call Start Time", key: "call_start_time"},
        {label: "Call Length (Seconds)", key: "dial_secs"},
        {label: "Call Result", key: "call_result"}
    ];

    useEffect(() => {
            runInterviewerCallHistoryReport();
        }, []
    );

    async function runInterviewerCallHistoryReport(): Promise<void> {
        const formValues: Record<string, any> = {};
        setMessageNoData("");
        //setReportFailed(false);
        setReportData([]);
        setInterviewerID(props.interviewer);
        formValues.survey_tla = props.surveyTla;
        formValues.interviewer = props.interviewer;
        formValues.start_date = props.startDate;
        formValues.end_date = props.endDate;
        formValues.instruments = props.instruments;


        let callHistory: InterviewerCallHistoryReport[];
        try {
            callHistory = await getInterviewerCallHistoryReport(formValues);
        } catch {
            //setReportFailed(true);
            return;
        } finally {
            //setSubmitting(false);
        }

        if (callHistory.length === 0) {
            setMessageNoData("No data found for parameters given.");
            return;
        }

        console.log(callHistory);
        setReportData(callHistory);

    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={[{link: "/", title: "Reports"}, {link: "#", title: "Interviewer details"}, {link: "#", title: "Instruments"}]}/>
            <main id="main-content" className="page__main u-mt-s">

                <ONSPanel status={"info"}>Displaying the call pattern report for INTERVIEWER, for the QUESTIONNAIRE questionnaire, for the period STARTDATE - ENDDATE</ONSPanel>
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

export default RenderReport;
