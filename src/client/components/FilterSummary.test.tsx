import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import FilterSummary from "./FilterSummary";

function renderComponent(questionnaires: string[]) {
    return render(
        <FilterSummary
            startDate={new Date("2022-05-04")}
            endDate={new Date("2022-05-05")}
            interviewer="Cal"
            questionnaires={questionnaires}
        />,
    );
}

describe("FilterSummary tests", () => {
    const multipleQuestionnaires: string[] = ["LMS", "OPN"];
    const singleQuestionnaire: string[] = ["LMS"];
    const noQuestionnaires: string[] = [];

    it("matches snapshot", () => {
        expect(renderComponent(noQuestionnaires)).toMatchSnapshot();
    });

    describe("renders interviewer and period correctly", () => {
        it("displays interviewer and the relevant information", () => {
            renderComponent(noQuestionnaires);
            expect(screen.getByRole("heading", { name: /Interviewer: Cal/ })).toBeVisible();
        });

        it("displays period and the relevant information", () => {
            renderComponent(noQuestionnaires);
            expect(screen.getByRole("heading", { name: /Period: 04\/05\/2022–05\/05\/2022/ })).toBeVisible();
        });
    });

    describe("renders correctly without questionnaires being filtered", () => {
        it("does not display questionnaire when no questionnaires have been passed through", () => {
            renderComponent(noQuestionnaires);
            expect(screen.queryByText(/Questionnaire/)).not.toBeInTheDocument();
        });
    });

    describe("it renders correctly when questionnaires are filtered", () => {
        it("displays one questionnaire and the relevant information", () => {
            renderComponent(singleQuestionnaire);
            expect(screen.getByRole("heading", { name: /Questionnaire: LMS/ })).toBeVisible();
        });

        it("displays multiple questionnaires and the relevant information", () => {
            renderComponent(multipleQuestionnaires);
            expect(screen.getByRole("heading", { name: /Questionnaires: LMS and OPN/ })).toBeVisible();
        });
    });
});
