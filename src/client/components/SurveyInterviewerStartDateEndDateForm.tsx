import React, { ReactElement } from "react";
import { StyledForm } from "blaise-design-system-react-components";
import {
    EndDateField, InterviewerField, StartDateField, SurveyField,
} from "./FormFields";

interface Props {
    interviewer: string | undefined
    surveyTLA: string | undefined
    startDate: Date
    endDate: Date
    onSubmit: (values: any, setSubmitting: (isSubmitting: boolean) => void) => void;
}

function SurveyInterviewerStartDateEndDateForm({
    interviewer,
    surveyTLA,
    startDate,
    endDate,
    onSubmit,
}: Props): ReactElement {
    const fields = [
        SurveyField(surveyTLA),
        InterviewerField(interviewer),
        StartDateField(startDate),
        EndDateField(endDate),
    ];

    return (
        <StyledForm fields={fields} onSubmitFunction={onSubmit} submitLabel="Next" />
    );
}

export default SurveyInterviewerStartDateEndDateForm;
