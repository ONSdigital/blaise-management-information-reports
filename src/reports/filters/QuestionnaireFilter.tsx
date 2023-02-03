import React, { ReactElement, useCallback } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import CallHistoryLastUpdatedStatus from "../../components/CallHistoryLastUpdatedStatus";
import FilterSummary from "../../components/FilterSummary";
import QuestionnaireSelector from "../../components/QuestionnaireSelector";
import { InterviewerFilterQuery } from "./InterviewerFilter";
import { LoadData } from "../../components/LoadData";
import { getQuestionnaireList } from "../../utilities/HTTP";

interface QuestionnaireFilterPageProps {
    interviewerFilterQuery: InterviewerFilterQuery,
    questionnaires: string[]
    setQuestionnaires: (string: string[]) => void
    onSubmit: () => void
    navigateBack: () => void
}

function FetchQuestionnairesError() {
    return (
        <>
            <h2>An error occurred while fetching the list of questionnaires</h2>
            <p>Try again later.</p>
            <p>If you are still experiencing problems <a href="https://ons.service-now.com/">report this
                issue</a> to Service Desk</p>
        </>
    );
}

function QuestionnaireFilter({
    interviewerFilterQuery,
    navigateBack,
    questionnaires,
    setQuestionnaires,
    onSubmit,
}: QuestionnaireFilterPageProps): ReactElement {
    const errorMessage = useCallback(() => <FetchQuestionnairesError />, []);

    return (
        <div>
            <Breadcrumbs
                BreadcrumbList={[
                    { link: "/", title: "Reports" },
                    { link: "#", onClickFunction: navigateBack, title: "Interviewer details" },
                ]}
            />
            <main id="main-content" className="ons-page__main ons-u-mt-s">
                <h1>Select questionnaires for</h1>
                <FilterSummary
                    interviewer={interviewerFilterQuery.interviewer}
                    startDate={interviewerFilterQuery.startDate}
                    endDate={interviewerFilterQuery.endDate}
                    questionnaires={questionnaires}
                />
                <CallHistoryLastUpdatedStatus />
                <LoadData
                    dataPromise={getQuestionnaireList(
                        interviewerFilterQuery.surveyTla,
                        interviewerFilterQuery.interviewer,
                        interviewerFilterQuery.startDate,
                        interviewerFilterQuery.endDate,
                    )}
                    errorMessage={errorMessage}
                >
                    { (loadedQuestionnaires) => (
                        <QuestionnaireSelector
                            questionnaires={loadedQuestionnaires}
                            selectedQuestionnaires={questionnaires}
                            setSelectedQuestionnaires={setQuestionnaires}
                            onSubmit={onSubmit}
                        />
                    ) }
                </LoadData>
            </main>
        </div>
    );
}

export default QuestionnaireFilter;
