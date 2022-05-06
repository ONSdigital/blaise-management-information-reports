//TODO:
// Sort out breadcrumbs
// Wording
// Spinning loading
import React, {useEffect, useState} from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import CallHistoryLastUpdatedStatus from "../../components/CallHistoryLastUpdatedStatus";
import {ErrorBoundary, GroupedSummary, ONSPanel, SummaryGroupTable} from "blaise-design-system-react-components";
import {CSVLink} from "react-csv";
import ReportErrorPanel from "../../components/ReportErrorPanel";

interface RenderInterviewerCallPatternReportPageProps {
    interviewer: string
    startDate: Date
    endDate: Date
    surveyTla: string
    instruments: string[]
}

function RenderInterviewerCallPatternReport(props: RenderInterviewerCallPatternReportPageProps) {
    const [reportFailed, setReportFailed] = useState<boolean>(false);
    const [groupedSummary, setGroupedSummary] = useState<GroupedSummary>(new GroupedSummary([]));

    const [interviewerID, setInterviewerID] = useState<string>("");

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
                            Information will be displayed at the top of the report to advise which fields were
                            incomplete.
                        </p>
                    </ONSPanel>
                </div>
                <br/>
                <CSVLink
                    hidden={groupedSummary.groups.length === 0}
                    data={groupedSummary.csv()}
                    target="_blank"
                    filename={`interviewer-call-pattern-${interviewerID}.csv`}>
                    Export report as Comma-Separated Values (CSV) file
                </CSVLink>

            </main>
        </>
    );
}

export default RenderInterviewerCallPatternReport;
