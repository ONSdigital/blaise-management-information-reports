import React, {
    ReactElement, useCallback, useMemo, useState,
} from "react";
import AppointmentFilter from "../filters/AppointmentFilter";
import AppointmentQuestionnaireFilter from "../filters/AppointmentQuestionnaireFilter";
import RenderAppointmentResourcePlanningReport from "./RenderAppointmentResourcePlanningReport";

enum Step {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    AppointmentFilter,
    QuestionnaireFilter,
    RenderReport,
}

function AppointmentResourcePlanning(): ReactElement {
    const [activeStep, setActiveStep] = useState<Step>(Step.AppointmentFilter);
    const [reportDate, setReportDate] = useState<Date>(new Date());
    const [surveyTla, setSurveyTla] = useState<string>("");
    const [questionnaires, setQuestionnaires] = useState<string[]>([]);

    const handleSubmit = useCallback(async () => {
        switch (activeStep) {
            case Step.AppointmentFilter:
                setActiveStep(Step.QuestionnaireFilter);
                break;
            case Step.QuestionnaireFilter:
                setActiveStep(Step.RenderReport);
                break;
            default:
                setActiveStep(Step.AppointmentFilter);
        }
    }, [setActiveStep, activeStep]);

    const navigateBack = useCallback(() => {
        setActiveStep((current) => current - 1);
    }, [setActiveStep]);

    const navigateBackTwoSteps = useCallback(() => {
        setActiveStep((current) => current - 2);
    }, [setActiveStep]);

    // eslint-disable-next-line consistent-return
    const currentStep = useMemo(() => {
        // eslint-disable-next-line default-case
        switch (activeStep) {
            case Step.AppointmentFilter:
                return (
                    <AppointmentFilter
                        title="appointment resource planning"
                        reportDate={reportDate}
                        setReportDate={setReportDate}
                        surveyTla={surveyTla}
                        setSurveyTla={setSurveyTla}
                        submitFunction={handleSubmit}
                    />
                );
            case Step.QuestionnaireFilter:
                return (
                    <AppointmentQuestionnaireFilter
                        reportDate={reportDate}
                        surveyTla={surveyTla}
                        questionnaires={questionnaires}
                        setQuestionnaires={setQuestionnaires}
                        submitFunction={handleSubmit}
                        navigateBack={navigateBack}
                    />
                );
            case Step.RenderReport:
                console.log(`Steps questionnaires ${questionnaires}`);
                return (
                    <RenderAppointmentResourcePlanningReport
                        reportDate={reportDate}
                        surveyTla={surveyTla}
                        questionnaires={questionnaires}
                        navigateBack={navigateBack}
                        navigateBackTwoSteps={navigateBackTwoSteps}
                    />
                );
        }
    }, [activeStep, reportDate, surveyTla, handleSubmit, questionnaires, navigateBack, navigateBackTwoSteps]);

    return (
        <div>
            <div className="ons-u-mt-m">
                {currentStep}
            </div>
        </div>
    );
}

export default AppointmentResourcePlanning;
