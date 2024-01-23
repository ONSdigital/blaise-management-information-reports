/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { createMemoryHistory, History } from "history";
import { render, waitFor } from "@testing-library/react";
import { Router } from "react-router";
import { act } from "react-dom/test-utils";
import { screen } from "@testing-library/dom";
import React from "react";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import dateFormatter from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import userEvent from "@testing-library/user-event";
import timekeeper from "timekeeper";
import subtractYears from "../../utilities/DateFormatter";
import { InterviewerFilterQuery } from "./InterviewerFilter";
import QuestionnaireFilter from "./QuestionnaireFilter";

const mockAdapter = new MockAdapter(axios);

const questionnaireDataReturned: string[] = [
    "LMS2101_AA1",
    "LMS2101_AA2",
];

dateFormatter.extend(utc);
dateFormatter.extend(timezone);

function DateHelper() {
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);

    return lastYear.toUTCString();
}

describe("the interviewer details page renders correctly", () => {
    let history: History;
    let setQuestionnaires: (questionnaires: string[]) => void;
    let submit: () => void;

    beforeEach(() => {
        mockAdapter
            .onGet("/api/reports/call-history-status")
            // .reply(200, {last_updated: "Sat, 01 Jan 2000 10:00:00 GMT"});
            .reply(200, { last_updated: subtractYears(1) });
        history = createMemoryHistory();
        setQuestionnaires = jest.fn();
        submit = jest.fn();
    });

    afterEach(() => {
        mockAdapter.reset();
    });

    function renderComponent() {
        const interviewerFilterQuery: InterviewerFilterQuery = {
            interviewer: "James",
            startDate: new Date("2022-01-01"),
            endDate: new Date("2022-01-05"),
            surveyTla: "LMS",
        };

        return render(
            <Router history={history}>
                <QuestionnaireFilter
                    interviewerFilterQuery={interviewerFilterQuery}
                    questionnaires={["LMS2101_AA1"]}
                    setQuestionnaires={setQuestionnaires}
                    onSubmit={submit}
                    navigateBack={() => {}}
                />
            </Router>,
        );
    }

    it("posts the query params", async () => {
        expect.assertions(4);
        mockAdapter.onPost(
            "/api/questionnaires",
            {
                asymmetricMatch: (formData: FormData) => {
                    expect(formData.get("survey_tla")).toBe("LMS");
                    expect(formData.get("interviewer")).toBe("James");
                    expect(formData.get("start_date")).toBe("2022-01-01");
                    expect(formData.get("end_date")).toBe("2022-01-05");
                    return true;
                },
            },
        ).reply(200, questionnaireDataReturned);
        renderComponent();

        // Wait for loading to finish (avoid warnings)
        await screen.findByText("LMS2101_AA1");
    });

    it("matches loading snapshot", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(200, questionnaireDataReturned);
        const wrapper = renderComponent();
        expect(wrapper).toMatchSnapshot();

        // Wait for loading to finish (avoid warnings)
        await screen.findByText("LMS2101_AA1");
    });

    it("matches snapshot", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(200, questionnaireDataReturned);
        timekeeper.freeze(new Date("2014-01-01"));

        mockAdapter
            .onGet("/api/reports/call-history-status")
            .reply(200, { last_updated: DateHelper() });

        const wrapper = renderComponent();
        await screen.findByText("LMS2101_AA1");

        expect(wrapper).toMatchSnapshot();
        timekeeper.reset();
    });

    it("renders correctly", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(200, questionnaireDataReturned);

        renderComponent();

        expect(await screen.findByText(/Select questionnaire/i)).toBeVisible();
        expect(await screen.findByText(/Data in this report was last updated:/i)).toBeVisible();

        expect(screen.getByText(/1 year ago/i)).toBeVisible();

        expect(screen.getByText(/Interviewer: James/i)).toBeVisible();
        expect(screen.getByText(/Period: 01\/01\/2022–05\/01\/2022/i)).toBeVisible();

        expect(screen.getByText(/Questionnaire: LMS2101_AA1/i)).toBeVisible();
        expect(screen.getByText(/Run report/i)).toBeVisible();
    });

    it("displays a message when no questionnaires are returned", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(200, []);
        renderComponent();
        await screen.findByText("No questionnaires found for given parameters.");
    });

    it("displays an error when an error HTTP status is returned", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(500, []);
        renderComponent();
        await screen.findByText("An error occurred while fetching the list of questionnaires");
    });

    it("displays an error when a non-200 success HTTP status is returned", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(201, questionnaireDataReturned);
        renderComponent();
        await screen.findByText("An error occurred while fetching the list of questionnaires");
    });

    it("checks current value questionnaires by default", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(200, questionnaireDataReturned);
        renderComponent();
        await act(async () => {
            userEvent.click(await screen.findByText(/Run report/));
        });
        await waitFor(() => expect(submit).toHaveBeenCalled());
        expect(setQuestionnaires).toHaveBeenCalledWith(["LMS2101_AA1"]);
    });

    it("returns the questionnaires when a checkbox is ticket", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(200, questionnaireDataReturned);
        renderComponent();
        await act(async () => {
            userEvent.click(await screen.findByLabelText(/LMS2101_AA1/));
            userEvent.click(await screen.findByLabelText(/LMS2101_AA2/));
            userEvent.click(await screen.findByText(/Run report/));
        });
        await waitFor(() => expect(submit).toHaveBeenCalled());
        expect(setQuestionnaires).toHaveBeenCalledWith(["LMS2101_AA2"]);
    });

    it("displays an error when submitting with no checkboxes selected", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(200, questionnaireDataReturned);
        renderComponent();
        await act(async () => {
            userEvent.click(await screen.findByLabelText(/LMS2101_AA1/));
            userEvent.click(await screen.findByText(/Run report/));
        });
        const elements = await screen.findAllByText("At least one questionnaire must be selected");
        expect(elements[0]).toBeVisible();
        expect(elements[1]).toBeVisible();
        expect(setQuestionnaires).not.toHaveBeenCalled();
        expect(submit).not.toHaveBeenCalled();
    });
});
