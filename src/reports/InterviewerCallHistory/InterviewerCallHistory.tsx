import React, { ReactElement, useState } from "react";
import InterviewerFilter, { InterviewerFilterQuery } from "../filters/InterviewerFilter";
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

    function _renderStepContent(step: number) {
        switch (step) {
        case Step.InterviewerFilter:
            return (<InterviewerFilter
                title="call history"
                query={ interviewerFilterQuery }
                submitFunction={ _handleInterviewerFilterSubmit }/>);
        case Step.QuestionnaireFilter:
            return (<QuestionnaireFilter
                interviewer={ interviewerFilterQuery.interviewer }
                startDate={ interviewerFilterQuery.startDate }
                endDate={ interviewerFilterQuery.endDate }
                surveyTla={ interviewerFilterQuery.surveyTla }
                questionnaires={ questionnaires } setQuestionnaires={ setQuestionnaires }
                submitFunction={ _handleQuestionnaireFilterSubmit }
                navigateBack={ _navigateBack }/>);
        case Step.RenderReport:
            console.log(`Steps questionnaires ${ questionnaires }`);
            return (<RenderInterviewerCallHistoryReport
                interviewer={ interviewerFilterQuery.interviewer }
                startDate={ interviewerFilterQuery.startDate }
                endDate={ interviewerFilterQuery.endDate }
                surveyTla={ interviewerFilterQuery.surveyTla }
                questionnaires={ questionnaires }
                navigateBack={ _navigateBack }
                navigateBackTwoSteps={ _navigateBackTwoSteps }/>);
        }
    }

    function _handleInterviewerFilterSubmit(query: InterviewerFilterQuery) {
        setInterviewerFilterQuery(query);
        setActiveStep(Step.QuestionnaireFilter);
    }

    function _handleQuestionnaireFilterSubmit() {
        setActiveStep(Step.RenderReport);
    }

    function _navigateBack() {
        setActiveStep(activeStep - 1);
    }

    function _navigateBackTwoSteps() {
        setActiveStep(activeStep - 2);
    }

    return (
        <div>
            <div className="u-mt-m">
                { _renderStepContent(activeStep) }
            </div>
        </div>
    );
}

export default InterviewerCallHistory;
