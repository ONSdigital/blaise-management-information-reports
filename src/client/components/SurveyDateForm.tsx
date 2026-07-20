import { StyledForm } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";

import { DateField, SurveyField } from "./FormFields";

interface Props {
  onSubmitFunction: (values: any, setSubmitting: (isSubmitting: boolean) => void) => void;
}

function SurveyDateForm({ onSubmitFunction }: Props): ReactElement {
  const fields = [SurveyField("undefined"), DateField()];

  return (
    <StyledForm
      fields={fields}
      onSubmitFunction={onSubmitFunction}
      submitLabel="Run"
    />
  );
}

export default SurveyDateForm;
