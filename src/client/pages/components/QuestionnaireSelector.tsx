import { type FormField, Panel, StyledForm } from "blaise-design-system-react-components";
import React, { type ReactElement, useCallback } from "react";

interface QuestionnaireSelectorProps {
  questionnaires: string[];
  selectedQuestionnaires: string[];
  setSelectedQuestionnaires: (string: string[]) => void;
  onSubmit: () => void;
}

function QuestionnaireSelector({
  questionnaires,
  selectedQuestionnaires,
  setSelectedQuestionnaires,
  onSubmit,
}: QuestionnaireSelectorProps): ReactElement {
  const handleSubmit = useCallback(
    (values: Record<string, string | string[]>) => {
      const selected = values.questionnaires;

      setSelectedQuestionnaires(Array.isArray(selected) ? selected : []);
      onSubmit();
    },
    [setSelectedQuestionnaires, onSubmit],
  );

  function displayCheckboxes(items: string[]) {
    if (items.length === 0) {
      return <Panel>No questionnaires found for given parameters.</Panel>;
    }

    const fields = [
      {
        name: "questionnaires",
        type: "checkbox",
        initialValue: selectedQuestionnaires,
        validate: (values: string[]) =>
          values.length > 0 ? undefined : "At least one questionnaire must be selected",
        checkboxOptions: items.map((name) => ({
          id: name,
          value: name,
          label: name,
          testid: name,
        })),
      },
    ] satisfies readonly FormField[];

    return (
      <StyledForm
        fields={fields}
        submitLabel="Run report"
        onSubmitFunction={handleSubmit}
      />
    );
  }

  return (
    <div className="ons-input-items">
      <div className="ons-checkboxes__items">{displayCheckboxes(questionnaires)}</div>
    </div>
  );
}

export default QuestionnaireSelector;
