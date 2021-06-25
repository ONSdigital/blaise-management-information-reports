import "@testing-library/jest-dom";
import React from "react";
import flushPromises, {mock_fetch_requests} from "../tests/utils";
import {createMemoryHistory} from "history";
import {cleanup, render, waitFor} from "@testing-library/react";
import {Router} from "react-router";
import {act} from "react-dom/test-utils";
import {fireEvent, screen} from "@testing-library/dom";
import InterviewerCallPattern from "./InterviewerCallPattern";

const reportDataReturned: any = {
    "hours_worked": "13:37:00",
    "call_time": "1:56:00",
    "hours_on_calls_percentage": "42%",
    "average_calls_per_hour": 3.14,
    "respondents_interviewed": 666,
    "households_completed_successfully": 911,
    "average_respondents_interviewed_per_hour": 420,
    "no_contacts_percentage": "10.10%",
    "appointments_for_contacts_percentage": "13.0%"
};

const mock_server_responses_with_data = (url: string) => {
    console.log(url);
    if (url.includes("/api/reports/interviewer-call-pattern")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(reportDataReturned),
        });
    } else if (url.includes("/api/reports/call-history-status")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({"last_updated": "Tue, 01 June 2021 10:00:00 GMT"}),
        });
    }
};

const mock_server_responses_without_data = (url: string) => {
    console.log(url);
    if (url.includes("/api/reports/interviewer-call-pattern")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(""),
        });
    } else if (url.includes("/api/reports/call-history-status")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(""),
        });
    }
};

describe("interviewer call pattern report with data", () => {

    beforeEach(() => {
        mock_fetch_requests(mock_server_responses_with_data);
    });

    it("matches snapshot", async () => {
        const history = createMemoryHistory();

        jest.useFakeTimers("modern");
        jest.setSystemTime(new Date("2021-01-01"));

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallPattern/>
            </Router>
        );

        jest.useRealTimers();

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("renders correctly", async () => {
        const history = createMemoryHistory();

        await act(async () => {
            render(
                <Router history={history}>
                    <InterviewerCallPattern/>
                </Router>
            );
        });

        expect(screen.queryByText("Report data last updated: 01/06/2021 11:00:00")).toBeVisible();
        expect(screen.queryByText("Run interviewer call pattern report")).toBeVisible();
        expect(screen.queryByText("Interviewer ID")).toBeVisible();
        expect(screen.queryByText("Start Date")).toBeVisible();
        expect(screen.queryByText("End Date")).toBeVisible();

        fireEvent.input(screen.getByLabelText(/Interviewer ID/i), {
            target: {
                value:
                    "ricer"
            }
        });

        await fireEvent.click(screen.getByTestId(/submit-call-pattern-form-button/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText("Export report as Comma-Separated Values (CSV) file")).toBeVisible();
            expect(screen.getByText("hours_worked")).toBeVisible();
            expect(screen.getByText("13:37:00")).toBeVisible();
            expect(screen.getByText("call_time")).toBeVisible();
            expect(screen.getByText("1:56:00")).toBeVisible();
            expect(screen.getByText("hours_on_calls_percentage")).toBeVisible();
            expect(screen.getByText("42%")).toBeVisible();
            expect(screen.getByText("average_calls_per_hour")).toBeVisible();
            expect(screen.getByText("3.14")).toBeVisible();
            expect(screen.getByText("respondents_interviewed")).toBeVisible();
            expect(screen.getByText("666")).toBeVisible();
            expect(screen.getByText("households_completed_successfully")).toBeVisible();
            expect(screen.getByText("911")).toBeVisible();
            expect(screen.getByText("average_respondents_interviewed_per_hour")).toBeVisible();
            expect(screen.getByText("420")).toBeVisible();
            expect(screen.getByText("no_contacts_percentage")).toBeVisible();
            expect(screen.getByText("10.10%")).toBeVisible();
            expect(screen.getByText("appointments_for_contacts_percentage")).toBeVisible();
            expect(screen.getByText("13.0%")).toBeVisible();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("interviewer call pattern report without data", () => {

    beforeEach(() => {
        mock_fetch_requests(mock_server_responses_without_data);
    });

    it("matches snapshot", async () => {
        const history = createMemoryHistory();

        jest.useFakeTimers("modern");
        jest.setSystemTime(new Date("2021-01-01"));

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallPattern/>
            </Router>
        );

        jest.useRealTimers();

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("renders correctly", async () => {
        const history = createMemoryHistory();

        await act(async () => {
            render(
                <Router history={history}>
                    <InterviewerCallPattern/>
                </Router>
            );
        });

        expect(screen.queryByText("Run interviewer call pattern report")).toBeVisible();
        expect(screen.queryByText("Interviewer ID")).toBeVisible();
        expect(screen.queryByText("Start Date")).toBeVisible();
        expect(screen.queryByText("End Date")).toBeVisible();

        fireEvent.input(screen.getByLabelText(/Interviewer ID/i), {
            target: {
                value:
                    "ricer"
            }
        });

        await fireEvent.click(screen.getByTestId(/submit-call-pattern-form-button/i));

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