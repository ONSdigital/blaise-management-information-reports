import { InterviewerCallHistoryReportData } from "../interfaces";
import "@testing-library/jest-dom";
import flushPromises, { mock_fetch_requests } from "../tests/utilities";
import { createMemoryHistory } from "history";
import { cleanup, render, waitFor } from "@testing-library/react";
import { Router } from "react-router";
import InterviewerCallHistory from "./InterviewerCallHistory";
import { act } from "react-dom/test-utils";
import { fireEvent, screen } from "@testing-library/dom";
import React from "react";
import MockDate from "mockdate";

const reportDataReturned: InterviewerCallHistoryReportData[] = [

    {
        questionnaire_name: "LMS2101_AA1",
        serial_number: "1337",
        call_start_time: "Sat, 01 May 2021 10:00:00 GMT",
        dial_secs: "61",
        call_result: "Busy"
    }];

const mock_server_responses_with_data = (url: string) => {
    console.log(url);
    if (url.includes("/api/reports/interviewer-call-history")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(reportDataReturned),
        });
    } else if (url.includes("/api/reports/call-history-status")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({ "last_updated": "Tue, 01 Jan 2000 10:00:00 GMT" }),
        });
    }
};

const mock_server_responses_without_data = (url: string) => {
    console.log(url);
    if (url.includes("/api/reports/interviewer-call-history")) {
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

const threeDaysFromTheNewMillennium = "2000-01-03";

describe("interviewer call history report with data", () => {
    afterEach(() => {
        MockDate.reset();
    });

    beforeEach(() => {
        mock_fetch_requests(mock_server_responses_with_data);
        MockDate.set(new Date(threeDaysFromTheNewMillennium));
    });

    it("matches snapshot", async () => {
        const history = createMemoryHistory();

        jest.useFakeTimers("modern");
        jest.setSystemTime(new Date("2021-01-01"));

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallHistory />
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
                    <InterviewerCallHistory />
                </Router>
            );
        });

        expect(screen.queryByText(/Data in this report was last updated:/i)).toBeVisible();
        expect(screen.queryByText(/2 days ago/i)).toBeVisible();
        expect(screen.queryByText("Run interviewer call history report")).toBeVisible();
        expect(screen.queryByText("Select survey")).toBeVisible();
        expect(screen.queryByText("Interviewer ID")).toBeVisible();
        expect(screen.queryByText("Start date")).toBeVisible();
        expect(screen.queryByText("End date")).toBeVisible();

        fireEvent.click(screen.getByText("LMS"));

        fireEvent.input(screen.getByLabelText(/Interviewer ID/i), {
            target: {
                value:
                    "ricer"
            }
        });

        await fireEvent.click(screen.getByTestId(/submit-button/i));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText("Export report as Comma-Separated Values (CSV) file")).toBeVisible();
            expect(screen.getByText("LMS2101_AA1")).toBeVisible();
            expect(screen.getByText("1337")).toBeVisible();
            expect(screen.getByText("01/05/2021 11:00:00")).toBeVisible();
            expect(screen.getByText("01:01")).toBeVisible();
            expect(screen.getByText("Busy")).toBeVisible();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("interviewer call history report without data", () => {
    afterEach(() => {
        MockDate.reset();
    });

    beforeEach(() => {
        mock_fetch_requests(mock_server_responses_without_data);
        MockDate.set(new Date(threeDaysFromTheNewMillennium));
    });

    it("matches snapshot", async () => {
        const history = createMemoryHistory();

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallHistory />
            </Router>
        );

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
                    <InterviewerCallHistory />
                </Router>
            );
        });

        expect(screen.queryByText("Run interviewer call history report")).toBeVisible();
        expect(screen.queryByText("Select survey")).toBeVisible();
        expect(screen.queryByText("Interviewer ID")).toBeVisible();
        expect(screen.queryByText("Start date")).toBeVisible();
        expect(screen.queryByText("End date")).toBeVisible();

        fireEvent.click(screen.getByText("LMS"));

        fireEvent.input(screen.getByLabelText(/Interviewer ID/i), {
            target: {
                value:
                    "ricer"
            }
        });

        await fireEvent.click(screen.getByTestId(/submit-button/i));

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
