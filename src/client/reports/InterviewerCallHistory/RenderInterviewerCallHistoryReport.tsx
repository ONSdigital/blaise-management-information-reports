import React, { type ReactElement, useState } from "react";
import { CSVLink } from "react-csv";

import Breadcrumbs from "../../pages/components/Breadcrumbs";
import CallHistoryLastUpdatedStatus from "../../pages/components/CallHistoryLastUpdatedStatus";
import CallHistoryReportTable from "../../pages/components/CallHistoryReportTable";
import FilterSummary from "../../pages/components/FilterSummary";
import { LoadData } from "../../pages/components/LoadData";
import ReportErrorPanel from "../../pages/components/ReportErrorPanel";
import { type InterviewerCallHistoryReport } from "../../types/interfaces";
import { formatDateAndTime } from "../../utils/dateFormatter";
import { getInterviewerCallHistoryReport } from "../../query/http";
import { type InterviewerFilterQuery } from "../filters/InterviewerFilter";

const CSVLinkComponent = CSVLink as unknown as React.ComponentType<Record<string, unknown>>;

interface CallHistoryReportFormValues {
  survey_tla: string;
  interviewer: string;
  start_date: Date;
  end_date: Date;
  questionnaires: string[];
}

interface RenderInterviewerCallHistoryReportPageProps {
  interviewerFilterQuery: InterviewerFilterQuery;
  questionnaires: string[];
  navigateBack: () => void;
  navigateBackTwoSteps: () => void;
}

function RenderInterviewerCallHistoryReport({
  interviewerFilterQuery,
  navigateBack,
  navigateBackTwoSteps,
  questionnaires,
}: RenderInterviewerCallHistoryReportPageProps): ReactElement {
  const [reportFailed, setReportFailed] = useState(false);

  const reportExportHeaders = [
    { label: "Interviewer", key: "interviewer" },
    { label: "Questionnaire", key: "questionnaire_name" },
    { label: "Serial Number", key: "serial_number" },
    { label: "Call Start Time", key: "call_start_time" },
    { label: "Call Length (Seconds)", key: "dial_secs" },
    { label: "Call Result", key: "call_result" },
  ];

  async function runInterviewerCallHistoryReport(): Promise<InterviewerCallHistoryReport[]> {
    const formValues: CallHistoryReportFormValues = {
      survey_tla: interviewerFilterQuery.surveyTla,
      interviewer: interviewerFilterQuery.interviewer,
      start_date: interviewerFilterQuery.startDate,
      end_date: interviewerFilterQuery.endDate,
      questionnaires,
    };

    const callHistory = await getInterviewerCallHistoryReport(formValues);

    console.log(callHistory);

    return callHistory;
  }

  return (
    <>
      <Breadcrumbs
        BreadcrumbList={[
          { link: "/", title: "Reports" },
          { link: "#", onClickFunction: navigateBackTwoSteps, title: "Interviewer details" },
          { link: "#", onClickFunction: navigateBack, title: "Questionnaires" },
        ]}
      />
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-s"
      >
        <h1>Call History Report</h1>
        <FilterSummary
          interviewer={interviewerFilterQuery.interviewer}
          startDate={interviewerFilterQuery.startDate}
          endDate={interviewerFilterQuery.endDate}
          questionnaires={questionnaires}
        />
        <ReportErrorPanel error={reportFailed} />
        <CallHistoryLastUpdatedStatus />
        <br />
        <LoadData
          dataPromise={runInterviewerCallHistoryReport()}
          onError={() => setReportFailed(true)}
          errorMessage={false}
        >
          {(reportData) => (
            <>
              <CSVLinkComponent
                hidden={reportData === null || reportData.length === 0}
                data={reportData?.map((row) => ({
                  ...row,
                  call_start_time: formatDateAndTime(row.call_start_time),
                }))}
                headers={reportExportHeaders}
                target="_blank"
                filename={`interviewer-call-history-${interviewerFilterQuery.interviewer}.csv`}
              >
                Export report as Comma-Separated Values (CSV) file
              </CSVLinkComponent>
              <CallHistoryReportTable
                messageNoData="No data found for parameters given."
                reportData={reportData}
              />
            </>
          )}
        </LoadData>
      </main>
    </>
  );
}

export default RenderInterviewerCallHistoryReport;
