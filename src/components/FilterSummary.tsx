import React, { ReactElement, ReactNode } from "react";
import { formatDate } from "../utilities/DateFormatter";

interface FilterSummaryProps{
    interviewer: string
    startDate: Date
    endDate: Date
    questionnaires: string[]
}

function formatList(listOfQuestionnaires: string[]): string {
    if (listOfQuestionnaires.length === 1) return listOfQuestionnaires[0];
    const firsts = listOfQuestionnaires.slice(0, listOfQuestionnaires.length - 1);
    const last = listOfQuestionnaires[listOfQuestionnaires.length - 1];
    return `${firsts.join(", ")} and ${last}`;
}

function FilterSummary({
    interviewer, startDate, endDate, questionnaires,
}: FilterSummaryProps): ReactElement {
    let questionaires: ReactNode = null;
    if (questionnaires.length > 0) {
        const questionnaireHeading = `Questionnaire${questionnaires.length > 1 ? "s" : ""}:`;
        questionaires = <>{questionnaireHeading} {formatList(questionnaires)}</>;
    }
    return (
        <h3 className="ons-u-mb-m">
            Interviewer: {interviewer}<br />
            Period: {formatDate(startDate)}–{formatDate(endDate)}<br />
            {questionaires}
        </h3>
    );
}

export default FilterSummary;
