import { ONSPanel, StyledForm } from "blaise-design-system-react-components";
import React, { ReactElement, useCallback } from "react";

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
        (values: any) => {
            setSelectedQuestionnaires(values.questionnaires);
            onSubmit();
        },
        [setSelectedQuestionnaires, onSubmit],
    );

    function displayCheckboxes(items: string[]) {
        if (items.length === 0) {
            return <ONSPanel>No questionnaires found for given parameters.</ONSPanel>;
        }

        const fields = [
            {
                name: "questionnaires",
                type: "checkbox",
                // The following types for initial_value and validate are incorrect, the value
                // should be string[] but the design system library currently only supports string.
                // Once the design system library is fixed, these should be fixed.
                initial_value: selectedQuestionnaires as unknown as string,
                validate: (values: string) => (values.length > 0 ? undefined : "At least one questionnaire must be selected"),
                checkboxOptions: items.map((name) => ({
                    id: name,
                    value: name,
                    label: name,
                    testid: name,
                })),
            },
        ];

        return <StyledForm fields={fields} submitLabel="Run report" onSubmitFunction={handleSubmit} />;
    }

    return (
        <div className="ons-input-items">
            <div className="ons-checkboxes__items">
                { displayCheckboxes(questionnaires) }
            </div>
        </div>
    );
}

export default QuestionnaireSelector;
