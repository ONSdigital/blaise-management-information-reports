import React, {ReactElement, useState} from "react";
import {ErrorBoundary, ONSPanel, GroupedSummaryAsCSV, SummaryGroupTable, GroupedSummary} from "blaise-design-system-react-components";
import {getInterviewerCallPatternReport} from "../utilities/HTTP";
import dateFormatter from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {CSVLink} from "react-csv";
import Breadcrumbs from "../components/Breadcrumbs";
import CallHistoryLastUpdatedStatus from "../components/CallHistoryLastUpdatedStatus";
import SurveyInterviewerStartDateEndDateForm from "../components/SurveyInterviewerStartDateEndDateForm";
import ReportErrorPanel from "../components/ReportErrorPanel";

dateFormatter.extend(utc);
dateFormatter.extend(timezone);



function InterviewerCallPattern(): ReactElement {
    const [interviewerID, setInterviewerID] = useState<string>("");
    const [messageNoData, setMessageNoData] = useState<string>("");
    const [reportData, setReportData] = useState<GroupedSummary>([]);
    const [reportFailed, setReportFailed] = useState<boolean>(false);

    async function runInterviewerCallPatternReport(formValues: any, setSubmitting: (isSubmitting: boolean) => void): Promise<void> {
        setMessageNoData("");
        setReportFailed(false);
        setReportData([]);
        setInterviewerID(formValues["Interviewer ID"]);
        formValues.survey_tla = formValues["Survey TLA"];
        formValues.interviewer = formValues["Interviewer ID"];
        formValues.start_date = new Date(formValues["Start date"]);
        formValues.end_date = new Date(formValues["End date"]);

        const [success, data] = await getInterviewerCallPatternReport(formValues);
        setSubmitting(false);

        if (!success) {
            setReportFailed(true);
            return;
        }

        if (Object.keys(data).length === 0) {
            setMessageNoData("No data found for parameters given.");
            return;
        }

        console.log(data);
        const callTimes: Group = callTimeSection(data);
        const callStatus: Group = callStatusSection(data);
        const noContactBreakdown: Group = noContactBreakdownSection(data);
        const groupedSummary: GroupedSummary = [callTimes, callStatus, noContactBreakdown];

        console.log(groupedSummary);
        setReportData(groupedSummary);
    }

    function callTimeSection(data: Record<string, any>): Group {
        return {
            title: "Call times",
            records: {
                hours_worked: data.hours_worked,
                call_time: data.call_time,
                hours_on_calls_percentage: data.hours_on_calls_percentage,
                average_calls_per_hour: data.average_calls_per_hour
            }
        };
    }

    function callStatusSection(data: Record<string, any>): Group {
        return {
            title: "Call status",
            records: {
                refusals: data.refusals,
                completed_successfully: data.completed_successfully,
                appointments_for_contacts: data.appointments_for_contacts,
                discounted_invalid_cases: data.discounted_invalid_cases,
                no_contacts: data.no_contacts
            }
        };
    }

    function noContactBreakdownSection(data: Record<string, any>): Group {
        return {
            title: "Breakdown of No Contact calls",
            records: {
                answer_service: data.no_contact_answer_service,
                busy: data.no_contact_busy,
                disconnect: data.no_contact_disconnect,
                no_answer: data.no_contact_no_answer,
                other: data.no_contact_other
            }
        };
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={[{link: "/", title: "Back"}]}/>
            <main id="main-content" className="page__main u-mt-s">
                <h1 className="u-mb-m">Run interviewer call pattern report</h1>
                <ReportErrorPanel error={reportFailed}/>
                <CallHistoryLastUpdatedStatus/>
                <div className="u-mb-m">
                    <ONSPanel>
                        <p>
                            Incomplete data is removed from this report. This will impact the accuracy of the report.
                        </p>
                        <p>
                            The <b>Discounted invalid records</b> entry will advise how many records have been removed.
                        </p>
                        <p>
                            The <b>Invalid fields</b> entry will advise which fields were incomplete.
                        </p>
                    </ONSPanel>
                </div>
                <SurveyInterviewerStartDateEndDateForm onSubmitFunction={runInterviewerCallPatternReport}/>
                <br/>
                <CSVLink hidden={Object.entries(reportData).length === 0}
                         data={GroupedSummaryAsCSV(reportData)}
                         target="_blank"
                         filename={`interviewer-call-pattern-${interviewerID}.csv`}>
                    Export report as Comma-Separated Values (CSV) file
                </CSVLink>
                <ErrorBoundary errorMessageText={"Failed to load"}>
                    {
                        Object.entries(reportData).length > 0
                            ?
                            <div className="summary u-mt-m">
                                <div className="summary__group" id="report-table">
                                    <SummaryGroupTable groupedSummary={reportData} />
                                </div>
                            </div>
                            :
                            <ONSPanel hidden={messageNoData === "" && true}>{messageNoData}</ONSPanel>
                    }
                    <br/>
                </ErrorBoundary>
            </main>
        </>
    );
}

export default InterviewerCallPattern;
