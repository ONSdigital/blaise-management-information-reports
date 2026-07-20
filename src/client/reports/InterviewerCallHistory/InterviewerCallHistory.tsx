import React, { type ReactElement, useCallback, useMemo, useState } from "react";

import InterviewerFilter, { type InterviewerFilterQuery } from "../filters/InterviewerFilter";
import QuestionnaireFilter from "../filters/QuestionnaireFilter";

import RenderInterviewerCallHistoryReport from "./RenderInterviewerCallHistoryReport";

enum Step {
  InterviewerFilter,

  QuestionnaireFilter,
  RenderReport,
}

function InterviewerCallHistory(): ReactElement {
  const [activeStep, setActiveStep] = useState<Step>(Step.InterviewerFilter);
  const [interviewerFilterQuery, setInterviewerFilterQuery] = useState<InterviewerFilterQuery>({
    interviewer: "",
    startDate: new Date(),
    endDate: new Date(),
    surveyTla: "",
  });
  const [questionnaires, setQuestionnaires] = useState<string[]>([]);

  const handleInterviewerFilterSubmit = useCallback(
    (query: InterviewerFilterQuery) => {
      setInterviewerFilterQuery(query);
      setActiveStep(Step.QuestionnaireFilter);
    },
    [setInterviewerFilterQuery, setActiveStep],
  );

  const handleQuestionnaireFilterSubmit = useCallback(() => {
    setActiveStep(Step.RenderReport);
  }, [setActiveStep]);

  const navigateBack = useCallback(() => {
    setActiveStep((current) => current - 1);
  }, [setActiveStep]);

  const navigateBackTwoSteps = useCallback(() => {
    setActiveStep((current) => current - 2);
  }, [setActiveStep]);

  const currentStep = useMemo(() => {
    switch (activeStep) {
      case Step.InterviewerFilter:
        return (
          <InterviewerFilter
            title="call history"
            query={interviewerFilterQuery}
            onSubmit={handleInterviewerFilterSubmit}
          />
        );
      case Step.QuestionnaireFilter:
        return (
          <QuestionnaireFilter
            interviewerFilterQuery={interviewerFilterQuery}
            questionnaires={questionnaires}
            setQuestionnaires={setQuestionnaires}
            onSubmit={handleQuestionnaireFilterSubmit}
            navigateBack={navigateBack}
          />
        );
      case Step.RenderReport:
        console.log(`Steps questionnaires ${questionnaires}`);

        return (
          <RenderInterviewerCallHistoryReport
            interviewerFilterQuery={interviewerFilterQuery}
            questionnaires={questionnaires}
            navigateBack={navigateBack}
            navigateBackTwoSteps={navigateBackTwoSteps}
          />
        );
    }
  }, [
    handleInterviewerFilterSubmit,
    handleQuestionnaireFilterSubmit,
    navigateBack,
    navigateBackTwoSteps,
    activeStep,
    interviewerFilterQuery,
    questionnaires,
  ]);

  return (
    <div>
      <div className="ons-u-mt-m">{currentStep}</div>
    </div>
  );
}

export default InterviewerCallHistory;
