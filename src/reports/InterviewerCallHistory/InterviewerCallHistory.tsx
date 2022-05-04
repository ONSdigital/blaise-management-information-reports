import React, {ReactElement, useState} from "react";
import InterviewerFilter from "../filters/InterviewerFilter";
import InstrumentFilter from "../filters/InstrumentFilter";
import RenderInterviewerCallHistoryReport from "./RenderInterviewerCallHistoryReport";

enum Step {
    InterviewerFilter,
    InstrumentFilter,
    RenderReport,
}

function InterviewerCallHistory(): ReactElement {
    const [activeStep, setActiveStep] = useState<Step>(Step.InterviewerFilter);
    const [interviewer, setInterviewer] = useState<string>("");
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [surveyTla, setSurveyTla] = useState<string>("");
    const [instruments, setInstruments] = useState<string[]>([]);

    function _renderStepContent(step: number) {
        switch (step) {
            case Step.InterviewerFilter:
                return (<InterviewerFilter interviewer={interviewer} setInterviewer={setInterviewer}
                                           startDate={startDate} setStartDate={setStartDate}
                                           endDate={endDate} setEndDate={setEndDate}
                                           surveyTla={surveyTla} setSurveyTla={setSurveyTla}
                                           submitFunction={_handleSubmit}/>);
            case Step.InstrumentFilter:
                return (<InstrumentFilter interviewer={interviewer}
                                          startDate={startDate}
                                          endDate={endDate}
                                          surveyTla={surveyTla}
                                          instruments={instruments} setInstruments={setInstruments}
                                          submitFunction={_handleSubmit}
                                          navigateBack={_navigateBack}/>);
            case Step.RenderReport:
                console.log(`Steps instruments ${instruments}`);
                return (<RenderInterviewerCallHistoryReport interviewer={interviewer}
                                                            startDate={startDate}
                                                            endDate={endDate}
                                                            surveyTla={surveyTla}
                                                            instruments={instruments}/>);
        }
    }

    async function _handleSubmit() {
        switch (activeStep) {
            case Step.InterviewerFilter:
                setActiveStep(Step.InstrumentFilter);
                break;
            case Step.InstrumentFilter:
                setActiveStep(Step.RenderReport);
                break;
            default:
                setActiveStep(Step.InstrumentFilter);
        }
    }

    function _navigateBack() {
        setActiveStep(activeStep - 1);
    }

    return (
        <div>
            <div className="u-mt-m">
                {_renderStepContent(activeStep)}
            </div>
        </div>

    );
}

export default InterviewerCallHistory;
