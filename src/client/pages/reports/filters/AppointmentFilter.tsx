import { StyledForm } from "blaise-design-system-react-components";
import React, { type ReactElement, useCallback } from "react";

import Breadcrumbs from "../../components/Breadcrumbs";
import { DateField, SurveyField } from "../../components/FormFields";
import AppointmentResourceDaybatchWarning from "../AppointmentResourcePlanning/AppointmentResourceDaybatchWarning";

interface AppointmentFilterPageProps {
  title: string;
  reportDate: Date;
  setReportDate: (Date: Date) => void;
  surveyTla: string | undefined;
  setSurveyTla: (string: string) => void;
  submitFunction: () => void;
}

function AppointmentFilter(props: AppointmentFilterPageProps): ReactElement {
  const { title, setReportDate, surveyTla, setSurveyTla, submitFunction } = props;

  const submitAppointmentFilters = useCallback(
    async (
      formValues: Record<string, string | string[]>,
      setSubmitting: (isSubmitting: boolean) => void,
    ): Promise<void> => {
      const reportDateValue = formValues.Date;
      const surveyValue = formValues["Survey TLA"];

      setReportDate(
        new Date(Array.isArray(reportDateValue) ? reportDateValue[0] : reportDateValue),
      );
      setSurveyTla(Array.isArray(surveyValue) ? surveyValue[0] : surveyValue);
      setSubmitting(true);
      submitFunction();
    },
    [setReportDate, setSurveyTla, submitFunction],
  );

  const fields = [SurveyField(surveyTla), DateField()];

  return (
    <div>
      <Breadcrumbs
        BreadcrumbList={[
          {
            link: "/",
            title: "Reports",
          },
        ]}
      />
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-s"
      >
        <h1 className="ons-u-mb-m">Run {title} report</h1>
        <AppointmentResourceDaybatchWarning />
        <br />
        <StyledForm
          fields={fields}
          onSubmitFunction={submitAppointmentFilters}
          submitLabel="Next"
        />
      </main>
    </div>
  );
}

export default AppointmentFilter;
