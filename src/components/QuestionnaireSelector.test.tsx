/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import QuestionnaireSelector from "./QuestionnaireSelector";
import React from "react";
import { render, RenderResult, waitFor } from "@testing-library/react";
import { fireEvent, screen } from "@testing-library/dom";
import { act } from "react-dom/test-utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mockAdapter = new MockAdapter(axios);

const questionnairesReturned = ["LMS2101_AA1", "LMS2101_BB1", "LMS2101_CC1"];
describe("QuestionnaireSelector tests", () => {
    let setSelectedQuestionnaires: (questionnaires: string[]) => void;
    let submit: () => void;
    let view: RenderResult;

    beforeEach(async () => {
        setSelectedQuestionnaires = jest.fn();
        submit = jest.fn();
        await act(async () => {
            view = renderComponent();
        });
    });

    afterEach(() => {
        mockAdapter.reset();
    });

    function renderComponent() {
        return render(
            <QuestionnaireSelector
                questionnaires={questionnairesReturned}
                selectedQuestionnaires={["LMS2101_AA1"]}
                setSelectedQuestionnaires={setSelectedQuestionnaires}
                onSubmit={submit}
            />
        );
    }

    it("matches snapshot", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(200, questionnairesReturned);
        await screen.findByText("LMS2101_AA1");
        expect(view).toMatchSnapshot();
    });

    describe("it renders correctly", () => {
        it("displays a 'Select All' button", () => {
            expect(screen.getByRole("button", { name: "Select All following checkboxes" })).toBeVisible();
        });

        it("displays all available questionnaires", () => {
            questionnairesReturned.forEach((questionnaire) => {
                expect(screen.getByText(questionnaire)).toBeVisible();
                expect(screen.getByRole("checkbox", { name: questionnaire })).toBeVisible();
            });
        });
    });

    describe("when a questionnaire is selected", () => {
        it("displays a tick in the checkbox", () => {
            const checkBox = screen.getByRole("checkbox", { name: "LMS2101_BB1" }, { checked: false });
            fireEvent.click(checkBox);
            expect(screen.getByRole("checkbox", { name: "LMS2101_BB1" }, { checked: true }));
        });

        it("returns the selected questionnaires when submitted", async () => {
            const checkBox = screen.getByRole("checkbox", { name: "LMS2101_BB1" }, { checked: false });
            fireEvent.click(checkBox);
            fireEvent.click(screen.getByRole("button", { name: "Run report" }));
            await waitFor(() => expect(submit).toHaveBeenCalled());
            expect(setSelectedQuestionnaires).toHaveBeenCalledWith(["LMS2101_AA1", "LMS2101_BB1"]);
        });
    });

    describe("when 'Select all' is selected", () => {
        it("selects all questionnaires", async () => {
            fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));
            questionnairesReturned.forEach((questionnaire) => {
                expect(view.getByRole("checkbox", { name: questionnaire }, { checked: true }));
            });
        });

        it("changes to unselect all", async () => {
            fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));
            expect(await view.getByRole("button", { name: "Unselect All following checkboxes" })).toBeVisible();
        });

        it("returns the selected questionnaires when submitted", async () => {
            fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));
            fireEvent.click(screen.getByRole("button", { name: "Run report" }));
            await waitFor(() => expect(submit).toHaveBeenCalled());
            expect(setSelectedQuestionnaires).toHaveBeenCalledWith(["LMS2101_AA1", "LMS2101_BB1", "LMS2101_CC1"]);
        });
    });

    describe("when 'Unselect all' is selected", () => {
        it("unselects all questionnaires", async () => {
            fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));
            fireEvent.click(await screen.findByRole("button", { name: /Unselect All/ }));
            questionnairesReturned.forEach((questionnaire) => {
                expect(view.getByRole("checkbox", { name: questionnaire }, { checked: false }));
            });
        });

        it("changes to select all", async () => {
            fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));
            fireEvent.click(await screen.findByRole("button", { name: /Unselect All/ }));
            expect(view.getByText(/Select All/)).toBeVisible();
        });

        it("returns the selected questionnaires when submitted", async () => {
            fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));
            fireEvent.click(await screen.findByRole("button", { name: /Unselect All/ }));
            fireEvent.click(screen.getByRole("button", { name: "Run report" }));
            await screen.findAllByText(/At least one questionnaire must be selected/);
            expect(submit).not.toHaveBeenCalled();
            expect(setSelectedQuestionnaires).not.toHaveBeenCalled();
        });
    });
});
