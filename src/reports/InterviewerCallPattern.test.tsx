/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";
import flushPromises from "../tests/utilities";
import { createMemoryHistory } from "history";
import { cleanup, render, waitFor } from "@testing-library/react";
import { Router } from "react-router";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import InterviewerCallPattern, {
    formatToFractionAndPercentage,
    callTimeSection,
    callStatusSection,
    noContactBreakdownSection, isAllInvalid, invalidFieldsGroup
} from "./InterviewerCallPattern";
import MockDate from "mockdate";
import { InterviewerCallPatternReport } from "../interfaces";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mockAdapter = new MockAdapter(axios);

const mockData: InterviewerCallPatternReport = {
    total_valid_cases: 133,
    hours_worked: "26:58:07",
    call_time: "01:31:32",
    hours_on_calls_percentage: 5.66,
    average_calls_per_hour: 3.86,
    refusals: 4,
    completed_successfully: 0,
    appointments_for_contacts: 81,
    web_nudge: 5,
    no_contacts: 11,
    no_contact_answer_service: 4,
    no_contact_busy: 1,
    no_contact_disconnect: 2,
    no_contact_no_answer: 3,
    no_contact_other: 4,
    invalid_fields: "n/a",
    discounted_invalid_cases: 0,
};

const mockDataWithInvalidCases: InterviewerCallPatternReport = {
    total_valid_cases: 133,
    hours_worked: "26:58:07",
    call_time: "01:31:32",
    hours_on_calls_percentage: 5.66,
    average_calls_per_hour: 3.86,
    refusals: 4,
    completed_successfully: 0,
    appointments_for_contacts: 81,
    web_nudge: 5,
    discounted_invalid_cases: 29,
    no_contacts: 11,
    no_contact_answer_service: 4,
    no_contact_busy: 1,
    no_contact_disconnect: 2,
    no_contact_no_answer: 3,
    no_contact_other: 4,
    invalid_fields: "'status' column had timed out call status,'call_end_time' column had missing data",
    total_records: 133 + 29,
};

const mockDataWithOnlyInvalidCases: InterviewerCallPatternReport = {
    discounted_invalid_cases: 100,
    invalid_fields: "'status' column had timed out call status,'call_end_time' column had missing data"
};

describe("function formatToFractionAndPercentage()", () => {
    it("should return a string demonstrating the total and percentage", () => {
        const actual = formatToFractionAndPercentage(1, 2);
        expect(actual).toEqual("1/2, 50.00%");
    });
});

describe("function callTimeSection()", () => {
    it("should return the relevant section from data", () => {
        const callSection = callTimeSection(mockDataWithInvalidCases);
        expect(callSection).toEqual({
            "records": {
                "average_calls_per_hour": mockDataWithInvalidCases.average_calls_per_hour,
                "call_time": mockDataWithInvalidCases.call_time,
                "hours_on_calls_percentage": "5.66%",
                "hours_worked": mockDataWithInvalidCases.hours_worked,
            },
            "title": "Call times",
        });
    });
});

describe("function callStatusSection()", () => {
    it("should return the relevant section from data", () => {
        const callSection = callStatusSection(mockDataWithInvalidCases);
        expect(callSection).toEqual({
            "records": {
                "refusals": "4/133, 3.01%",
                "completed_successfully": "0/133, 0.00%",
                "appointments_for_contacts": "81/133, 60.90%",
                "web_nudge": "5/133, 3.76%",
                "no_contacts": "11/133, 8.27%",
                "discounted_invalid_cases": "29/162, 17.90%",
            },
            "title": "Call status",
        });
    });
});

describe("function noContactBreakdownSection()", () => {
    it("should return the relevant section from data", () => {
        const callSection = noContactBreakdownSection(mockDataWithInvalidCases);
        expect(callSection).toEqual({
            "records": {
                "answer_service": "4/11, 36.36%",
                "busy": "1/11, 9.09%",
                "disconnect": "2/11, 18.18%",
                "no_answer": "3/11, 27.27%",
                "other": "4/11, 36.36%",
            },
            "title": "Breakdown of No Contact calls",
        });
    });
});

describe("function invalidFieldsGroup()", () => {
    it("should return the required information to display in an information panel", () => {
        const invalidPanel = invalidFieldsGroup(mockDataWithInvalidCases);
        expect(invalidPanel).toEqual({
            "records": {
                "invalid_fields": "'status' column had timed out call status,'call_end_time' column had missing data",
                "discounted_invalid_cases": 29,
                "total_records": (mockDataWithInvalidCases.total_valid_cases || 0) + mockDataWithInvalidCases.discounted_invalid_cases,
            },
            "title": "Invalid Fields",
        });
    });
});

describe("function isAllInvalid()", () => {
    it("should return true if data does not have total_valid_cases", () => {
        const expectTrue = isAllInvalid(mockDataWithOnlyInvalidCases);
        expect(expectTrue).toEqual(true);
    });

    it("should return false if data has total_valid_cases", () => {
        const expectFalse = isAllInvalid(mockData);
        expect(expectFalse).toEqual(false);
    });
});

describe("function InterviewerCallPattern() with happy data", () => {
    afterEach(() => {
        MockDate.reset();
        mockAdapter.reset();
    });

    beforeEach(() => {
        mockAdapter.onPost("/api/reports/interviewer-call-pattern").reply(
            200, mockData
        );
        mockAdapter.onGet("/api/reports/call-history-status").reply(
            200, { "last_updated": "Tue, 01 Jan 2000 10:00:00 GMT" }
        );
        MockDate.set(new Date(threeDaysFromTheNewMillennium));
    });

    it("should match the snapshot", async () => {
        const history = createMemoryHistory();

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallPattern />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();

        await act(async () => {
            render(
                <Router history={history}>
                    <InterviewerCallPattern />
                </Router>
            );
        });

        expect(screen.queryByText(/Data in this report was last updated:/i)).toBeVisible();
        expect(screen.queryByText(/2 days ago/i)).toBeVisible();
        expect(screen.queryByText("Run interviewer call pattern report")).toBeVisible();
        expect(screen.queryByText("Select survey")).toBeVisible();
        expect(screen.queryByText("Interviewer ID")).toBeVisible();
        expect(screen.queryByText("Start date")).toBeVisible();
        expect(screen.queryByText("End date")).toBeVisible();

        userEvent.click(screen.getByText("LMS"));

        userEvent.type(screen.getByLabelText(/Interviewer ID/i), "ricer");

        userEvent.click(screen.getByTestId(/submit-button/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText("Export report as Comma-Separated Values (CSV) file")).toBeVisible();

            expect(screen.getByText("Call times")).toBeVisible();
            expect(screen.getByText("Hours worked")).toBeVisible();
            expect(screen.getByText("26:58:07")).toBeVisible();
            expect(screen.getByText("Call time")).toBeVisible();
            expect(screen.getByText("01:31:32")).toBeVisible();
            expect(screen.getByText("Hours on calls percentage")).toBeVisible();
            expect(screen.getByText("5.66%")).toBeVisible();
            expect(screen.getByText("Average calls per hour")).toBeVisible();
            expect(screen.getByText("3.86")).toBeVisible();

            expect(screen.getByText("Call status")).toBeVisible();
            expect(screen.getByText("Refusals")).toBeVisible();
            expect(screen.getByText("4/133, 3.01%")).toBeVisible();
            expect(screen.getByText("Completed successfully")).toBeVisible();
            expect(screen.getAllByText("0/133, 0.00%")).toHaveLength(2);
            expect(screen.getByText("Appointments for contacts")).toBeVisible();
            expect(screen.getByText("81/133, 60.90%")).toBeVisible();
            expect(screen.getByText("Web nudge")).toBeVisible();
            expect(screen.getByText("5/133, 3.76%")).toBeVisible();
            expect(screen.getByText("Discounted invalid cases")).toBeVisible();
            expect(screen.queryByText("29/133, 21.80%")).not.toBeInTheDocument();
            expect(screen.getByText("No contacts")).toBeVisible();
            expect(screen.getByText("11/133, 8.27%")).toBeVisible();

            expect(screen.getByText("Breakdown of No Contact calls")).toBeVisible();
            expect(screen.getByText("Answer service")).toBeVisible();
            expect(screen.queryAllByText("4/11, 36.36%")[0]).toBeVisible();
            expect(screen.getByText("Busy")).toBeVisible();
            expect(screen.getByText("1/11, 9.09%")).toBeVisible();
            expect(screen.getByText("Disconnect")).toBeVisible();
            expect(screen.getByText("2/11, 18.18%")).toBeVisible();
            expect(screen.getByText("No answer")).toBeVisible();
            expect(screen.getByText("3/11, 27.27%")).toBeVisible();
            expect(screen.getByText("Other")).toBeVisible();
            expect(screen.queryAllByText("4/11, 36.36%")[1]).toBeVisible();
        });

        expect(screen.queryByText(/were discounted due to the following invalid fields/i)).not.toBeInTheDocument();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("function InterviewerCallPattern() with data and invalid data", () => {
    afterEach(() => {
        MockDate.reset();
        mockAdapter.reset();
    });

    beforeEach(() => {
        mockAdapter.onPost("/api/reports/interviewer-call-pattern").reply(
            200, mockDataWithInvalidCases
        );
        mockAdapter.onGet("/api/reports/call-history-status").reply(
            200, { "last_updated": "Tue, 01 Jan 2000 10:00:00 GMT" }
        );
        MockDate.set(new Date(threeDaysFromTheNewMillennium));
    });

    it("should match the snapshot", async () => {
        const history = createMemoryHistory();

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallPattern />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();

        await act(async () => {
            render(
                <Router history={history}>
                    <InterviewerCallPattern />
                </Router>
            );
        });

        expect(screen.queryByText(/Data in this report was last updated:/i)).toBeVisible();
        expect(screen.queryByText(/2 days ago/i)).toBeVisible();
        expect(screen.queryByText("Run interviewer call pattern report")).toBeVisible();
        expect(screen.queryByText("Select survey")).toBeVisible();
        expect(screen.queryByText("Interviewer ID")).toBeVisible();
        expect(screen.queryByText("Start date")).toBeVisible();
        expect(screen.queryByText("End date")).toBeVisible();

        userEvent.click(screen.getByText("LMS"));

        userEvent.type(screen.getByLabelText(/Interviewer ID/i), "ricer");

        userEvent.click(screen.getByTestId(/submit-button/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText("Export report as Comma-Separated Values (CSV) file")).toBeVisible();

            expect(screen.getByText("Call times")).toBeVisible();
            expect(screen.getByText("Hours worked")).toBeVisible();
            expect(screen.getByText("26:58:07")).toBeVisible();
            expect(screen.getByText("Call time")).toBeVisible();
            expect(screen.getByText("01:31:32")).toBeVisible();
            expect(screen.getByText("Hours on calls percentage")).toBeVisible();
            expect(screen.getByText("5.66%")).toBeVisible();
            expect(screen.getByText("Average calls per hour")).toBeVisible();
            expect(screen.getByText("3.86")).toBeVisible();

            expect(screen.getByText("Call status")).toBeVisible();
            expect(screen.getByText("Refusals")).toBeVisible();
            expect(screen.getByText("4/133, 3.01%")).toBeVisible();
            expect(screen.getByText("Completed successfully")).toBeVisible();
            expect(screen.getByText("0/133, 0.00%")).toBeVisible();
            expect(screen.getByText("Appointments for contacts")).toBeVisible();
            expect(screen.getByText("81/133, 60.90%")).toBeVisible();
            expect(screen.getByText("Web nudge")).toBeVisible();
            expect(screen.getByText("5/133, 3.76%")).toBeVisible();
            expect(screen.getByText("No contacts")).toBeVisible();
            expect(screen.getByText("11/133, 8.27%")).toBeVisible();
            expect(screen.getByText("Discounted invalid cases")).toBeVisible();
            expect(screen.getByText("29/162, 17.90%")).toBeVisible();

            expect(screen.getByText("Breakdown of No Contact calls")).toBeVisible();
            expect(screen.getByText("Answer service")).toBeVisible();
            expect(screen.queryAllByText("4/11, 36.36%")[0]).toBeVisible();
            expect(screen.getByText("Busy")).toBeVisible();
            expect(screen.getByText("1/11, 9.09%")).toBeVisible();
            expect(screen.getByText("Disconnect")).toBeVisible();
            expect(screen.getByText("2/11, 18.18%")).toBeVisible();
            expect(screen.getByText("No answer")).toBeVisible();
            expect(screen.getByText("3/11, 27.27%")).toBeVisible();
            expect(screen.getByText("Other")).toBeVisible();
            expect(screen.queryAllByText("4/11, 36.36%")[1]).toBeVisible();

            expect(screen.getByText(/were discounted due to the following invalid fields/i)).toBeVisible();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("function InterviewerCallPattern() without data", () => {
    afterEach(() => {
        MockDate.reset();
        mockAdapter.reset();
    });

    beforeEach(() => {
        mockAdapter.onPost("/api/reports/interviewer-call-pattern").reply(
            200, {}
        );
        mockAdapter.onGet("/api/reports/call-history-status").reply(
            200, {}
        );
        MockDate.set(new Date(threeDaysFromTheNewMillennium));
    });

    it("should match the snapshot", async () => {
        const history = createMemoryHistory();

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallPattern />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();

        await act(async () => {
            render(
                <Router history={history}>
                    <InterviewerCallPattern />
                </Router>
            );
        });

        expect(screen.queryByText("Run interviewer call pattern report")).toBeVisible();
        expect(screen.queryByText("Select survey")).toBeVisible();
        expect(screen.queryByText("Interviewer ID")).toBeVisible();
        expect(screen.queryByText("Start date")).toBeVisible();
        expect(screen.queryByText("End date")).toBeVisible();

        userEvent.click(screen.getByText("LMS"));

        userEvent.type(screen.getByLabelText(/Interviewer ID/i), "ricer");

        userEvent.click(screen.getByTestId(/submit-button/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.queryByText("Export report as Comma-Separated Values (CSV) file")).not.toBeVisible();
            expect(screen.queryByText("No data found for parameters given.")).toBeVisible();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("function InterviewerCallPattern() with only invalid data", () => {
    afterEach(() => {
        MockDate.reset();
        mockAdapter.reset();
    });

    beforeEach(() => {
        mockAdapter.onPost("/api/reports/interviewer-call-pattern").reply(
            200, mockDataWithOnlyInvalidCases
        );
        mockAdapter.onGet("/api/reports/call-history-status").reply(
            200, { "last_updated": "Tue, 01 Jan 2000 10:00:00 GMT" }
        );
        MockDate.set(new Date(threeDaysFromTheNewMillennium));
    });

    it("should match the snapshot", async () => {
        const history = createMemoryHistory();

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallPattern />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();

        await act(async () => {
            render(
                <Router history={history}>
                    <InterviewerCallPattern />
                </Router>
            );
        });

        expect(screen.queryByText(/Data in this report was last updated:/i)).toBeVisible();
        expect(screen.queryByText(/2 days ago/i)).toBeVisible();
        expect(screen.queryByText("Run interviewer call pattern report")).toBeVisible();
        expect(screen.queryByText("Select survey")).toBeVisible();
        expect(screen.queryByText("Interviewer ID")).toBeVisible();
        expect(screen.queryByText("Start date")).toBeVisible();
        expect(screen.queryByText("End date")).toBeVisible();

        userEvent.click(screen.getByText("LMS"));

        userEvent.type(screen.getByLabelText(/Interviewer ID/i), "ricer");

        userEvent.click(screen.getByTestId(/submit-button/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.queryByText("Export report as Comma-Separated Values (CSV) file")).not.toBeVisible();
            expect(screen.queryByText("Call times")).not.toBeInTheDocument();
            expect(screen.queryByText("Call status")).not.toBeInTheDocument();
            expect(screen.queryByText("Breakdown of no Contact calls")).not.toBeInTheDocument();
            expect(screen.queryByText("Invalid Fields")).not.toBeInTheDocument();

            expect(screen.getByText(/Information: 100\/100 records \(100.00%\) were discounted due to the following invalid fields:/i)).toBeVisible();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

const threeDaysFromTheNewMillennium = "2000-01-03";
