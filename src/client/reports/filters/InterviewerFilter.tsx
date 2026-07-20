import React, { type ReactElement, useCallback } from "react";

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
  const submitInterviewerFilters = useCallback(
    async (
      formValues: Record<string, string | string[]>,
      setSubmitting: (isSubmitting: boolean) => void,
    ): Promise<void> => {
      const interviewer = formValues["Interviewer ID"];
      const startDate = formValues["Start date"];
      const endDate = formValues["End date"];
      const surveyTla = formValues["Survey TLA"];

      setSubmitting(true);
      onSubmit({
        interviewer: Array.isArray(interviewer) ? interviewer[0] : interviewer,
        startDate: new Date(Array.isArray(startDate) ? startDate[0] : startDate),
        endDate: new Date(Array.isArray(endDate) ? endDate[0] : endDate),
        surveyTla: Array.isArray(surveyTla) ? surveyTla[0] : surveyTla,
      });
    },
    [onSubmit],
  );

  return (
    <div>
      <Breadcrumbs BreadcrumbList={[{ link: "/", title: "Reports" }]} />
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-s"
      >
        <h1 className="ons-u-mb-m">Run interviewer {title} report</h1>
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
  );
}

export default InterviewerFilter;
