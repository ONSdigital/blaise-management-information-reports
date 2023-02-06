import { StyledForm } from "blaise-design-system-react-components";
import React, { ReactElement, useCallback } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import AppointmentResourceDaybatchWarning from "../AppointmentResourcePlanning/AppointmentResourceDaybatchWarning";
import { DateField, SurveyField } from "../../components/FormFields";

interface AppointmentFilterPageProps {
    title: string;
    reportDate: Date;
    setReportDate: (Date: Date) => void;
    surveyTla: string | undefined;
    setSurveyTla: (string: string) => void;
    submitFunction: () => void;
}

function AppointmentFilter(props: AppointmentFilterPageProps): ReactElement {
    const {
        title,
        setReportDate,
        surveyTla,
        setSurveyTla,
        submitFunction,
    } = props;

    const submitAppointmentFilters = useCallback(
        async (formValues: Record<string, any>, setSubmitting: (isSubmitting: boolean) => void): Promise<void> => {
            setReportDate(formValues.Date);
            setSurveyTla(formValues["Survey TLA"]);
            setSubmitting(true);
            submitFunction();
        },
        [setReportDate, setSurveyTla, submitFunction],
    );

    const fields = [
        SurveyField(surveyTla),
        DateField(),
    ];

    return (
        <div>
            <Breadcrumbs
                BreadcrumbList={[{
                    link: "/",
                    title: "Reports",
                }]}
            />
            <main id="main-content" className="ons-page__main ons-u-mt-s">
                <h1 className="ons-u-mb-m">Run {title} report</h1>
                <AppointmentResourceDaybatchWarning />
                <br />
                <StyledForm fields={fields} onSubmitFunction={submitAppointmentFilters} submitLabel="Next" />
            </main>
        </div>
    );
}

export default AppointmentFilter;
