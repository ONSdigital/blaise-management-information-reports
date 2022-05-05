import {StyledForm} from "blaise-design-system-react-components";
import React, {ReactElement} from "react";
import dateFormatter from "dayjs";
import Breadcrumbs from "../../components/Breadcrumbs";
import CallHistoryLastUpdatedStatus from "../../components/CallHistoryLastUpdatedStatus";

interface InterviewerFilterPageProps {
    title: string
    interviewer: string | undefined
    setInterviewer: (string: string) => void
    startDate: Date
    setStartDate: (Date: Date) => void
    endDate: Date
    setEndDate: (Date: Date) => void
    surveyTla: string | undefined
    setSurveyTla: (string: string) => void
    submitFunction: () => void;
}

function InterviewerFilter(props: InterviewerFilterPageProps): ReactElement {
    const {
        title,
        interviewer,
        setInterviewer,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        surveyTla,
        setSurveyTla,
        submitFunction
    } = props;

    async function submitInterviewerFilters(formValues: Record<string, any>, setSubmitting: (isSubmitting: boolean) => void): Promise<void> {
        setInterviewer(formValues["Interviewer ID"]);
        setStartDate(formValues["Start date"]);
        setEndDate(formValues["End date"]);
        setSurveyTla(formValues["Survey TLA"]);
        setSubmitting(true);
        submitFunction();
    }

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
            initial_value: surveyTla,
            radioOptions: [
                {id: "all", value: "", label: "Show all surveys"},
                {id: "lms", value: "lms", label: "LMS", description: "Labour Market Survey"},
                {id: "opn", value: "opn", label: "OPN", description: "Opinions and Lifestyle Survey"}
            ]
        },
        {
            name: "Interviewer ID",
            type: "text",
            initial_value: interviewer,
            validate: validateInterviewer
        },
        {
            name: "Start date",
            type: "date",
            initial_value: dateFormatter(startDate).format("YYYY-MM-DD"),
            validate: validateDate
        },
        {
            name: "End date",
            type: "date",
            initial_value: dateFormatter(endDate).format("YYYY-MM-DD"),
            validate: validateDate
        }
    ];

    return (
        <>
            <div>
                <Breadcrumbs
                    BreadcrumbList={[{link: "/", title: "Reports"}]}/>
                <main id="main-content" className="page__main u-mt-s">
                    <h1 className="u-mb-m">Run interviewer {title} report</h1>
                    <CallHistoryLastUpdatedStatus/>
                    <StyledForm fields={fields} onSubmitFunction={submitInterviewerFilters} submitLabel={"Next"}/>
                </main>
            </div>
        </>
    )
        ;
}

export default InterviewerFilter;


