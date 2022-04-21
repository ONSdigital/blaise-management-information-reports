import React, {ReactElement, useState} from "react";
import {ONSButton} from "blaise-design-system-react-components";
import {Formik, Form} from "formik";
import InterviewerFilter from "./filters/InterviewerFilter";
import InstrumentFilter from "./filters/InstrumentFilter";

enum Step {
    InterviewerFilter,
    InstrumentFilter,
    RenderReport,
}

function InterviewerCallHistoryReport(): ReactElement {
    const [activeStep, setActiveStep] = useState<Step>(Step.InterviewerFilter);
    const [interviewer, setInterviewer] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [surveyTla, setSurveyTla] = useState<string>("");
    const [instruments, setInstruments] = useState<string[]>([""]);

    function _renderStepContent(step: number) {
        console.log(`Current step: ${step}`);
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
                    //instruments={instruments} setInstruments={setInstruments}/>);
                                          submitFunction={_handleSubmit}/>);
        }
    }

    async function _handleSubmit() {
        console.log(`Here is the active step ${activeStep}`);
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

    return (
        <Formik
            validateOnBlur={false}
            validateOnChange={false}
            initialValues={{override: ""}}
            onSubmit={_handleSubmit}>
            {({isSubmitting}) => (
                <Form id={"formID"}>
                    <div>
                        <div className="u-mt-m">
                            {_renderStepContent(activeStep)}
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
}

export default InterviewerCallHistoryReport;
