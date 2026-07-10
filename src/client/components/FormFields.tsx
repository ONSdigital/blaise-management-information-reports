import { formatISODate } from "../utilities/DateFormatter";

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

function SurveyField(surveyTLA: string | undefined): any {
    return {
        name: "Survey TLA",
        description: "Select survey",
        type: "radio",
        initial_value: surveyTLA,
        radioOptions: [
            { id: "all", value: "", label: "Show all surveys" },
            {
                id: "lms", value: "lms", label: "LMS", description: "Labour Market Survey",
            },
            {
                id: "opn", value: "opn", label: "OPN", description: "Opinions and Lifestyle Survey",
            },
        ],
    };
}

function InterviewerField(interviewer: string | undefined): any {
    return {
        name: "Interviewer ID",
        type: "text",
        initial_value: interviewer,
        validate: validateInterviewer,
    };
}

function StartDateField(startDate: string | Date): any {
    return {
        name: "Start date",
        type: "date",
        initial_value: formatISODate(startDate),
        validate: validateDate,
    };
}

function EndDateField(endDate: string | Date): any {
    return {
        name: "End date",
        type: "date",
        initial_value: formatISODate(endDate),
        validate: validateDate,
    };
}

function DateField(): any {
    return {
        name: "Date",
        type: "date",
        initial_value: formatISODate(new Date()),
        validate: validateDate,
    };
}

export {
    SurveyField, InterviewerField, StartDateField, EndDateField, DateField,
};
