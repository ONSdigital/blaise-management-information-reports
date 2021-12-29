import React, { ReactElement } from "react";
import { StyledForm } from "blaise-design-system-react-components";
import dateFormatter from "dayjs";

interface Props {
    onSubmitFunction: any;
}

const SurveyInterviewerStartDateEndDateForm = ({ onSubmitFunction }: Props): ReactElement => {

    const validateInterviewer = (value: string) => {
        let error;
        if (value === "" || value === undefined) {
            error = "Enter a interviewer ID";
        }
        return error;
    };

    const validateDate = (value: string) => {
        let error;
        if (value === "" || value === undefined) {
            error = "Enter a date";
            return error;
        }

        if (value.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/) === null) {
            error = "Enter a valid date";
        }
        return error;
    };

    const fields = [
        {
            name: "Survey TLA",
            description: "Select survey",
            type: "radio",
            initial_value: "undefined",
            radioOptions: [
                { id: "all", value: "undefined", label: "Show all surveys" },
                { id: "lms", value: "lms", label: "LMS", description: "Labour Market Survey" },
                { id: "opn", value: "opn", label: "OPN", description: "Opinions and Lifestyle Survey" }
            ]
        },
        {
            name: "Interviewer ID",
            type: "text",
            validate: validateInterviewer
        },
        {
            name: "Start date",
            type: "date",
            initial_value: dateFormatter(new Date()).format("YYYY-MM-DD"),
            validate: validateDate
        },
        {
            name: "End date",
            type: "date",
            initial_value: dateFormatter(new Date()).format("YYYY-MM-DD"),
            validate: validateDate
        }
    ];

    return (
        <>
            <StyledForm fields={fields} onSubmitFunction={onSubmitFunction} submitLabel={"Run"} />
        </>
    );
};

export default SurveyInterviewerStartDateEndDateForm;
