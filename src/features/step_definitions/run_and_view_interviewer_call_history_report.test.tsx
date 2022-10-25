/**
 * @jest-environment jsdom
 */

import { defineFeature, loadFeature } from "jest-cucumber";
import { createMemoryHistory } from "history";
import { render, screen, waitFor } from "@testing-library/react";
import { Router } from "react-router-dom";
import App from "../../App";
import React from "react";
import { act } from "react-dom/test-utils";
import flushPromises from "../../tests/utilities";
import { InterviewerCallHistoryReport } from "../../interfaces";
import userEvent from "@testing-library/user-event";
import { AuthManager } from "blaise-login-react-client";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import "@testing-library/jest-dom";

const mockAdapter = new MockAdapter(axios);

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

const feature = loadFeature(
    "./src/features/run_and_view_interviewer_call_history_report.feature",
    { tagFilter: "not @server and not @integration" },
);

const reportDataReturned: InterviewerCallHistoryReport[] = [
    {
        questionnaire_name: "LMS2101_AA1",
        serial_number: "1337",
        call_start_time: "Sat, 01 May 2021 10:00:00 GMT",
        dial_secs: 61,
        call_result: "Busy",
    }];

const questionnaireDataReturned: string[] = [
    "LMS2101_AA1",
];

defineFeature(feature, test => {
    beforeEach(() => {
        mockAdapter.onPost("/api/questionnaires").reply(200, questionnaireDataReturned);
        mockAdapter.onPost("/api/reports/interviewer-call-history").reply(200, reportDataReturned);
        mockAdapter.onGet("/api/reports/call-history-status").reply(200,
            { "last_updated": "Fri, 28 May 2021 10:00:00 GMT" });
    });

    afterEach(() => {
        mockAdapter.reset();
    });

    test("Run and view interviewer call history report", ({ given, when, then }) => {
        given("An interviewer ID and time period (start date and end date) has been specified", async () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App />
                </Router>,
            );

            await act(async () => {
                await flushPromises();
            });

            userEvent.click(screen.getByText("Interviewer call history"));

            await act(async () => {
                await flushPromises();
            });

            userEvent.click(screen.getByText("LMS"));

            userEvent.type(screen.getByLabelText(/Interviewer ID/i), "ricer");

        });

        when("I click next to retrieve a list of questionnaires", async () => {
            userEvent.click(screen.getByTestId(/submit-button/i));

            await act(async () => {
                await flushPromises();
            });
        });

        when("I select a questionnaire and click on run report", async () => {
            userEvent.click(screen.getByLabelText(/LMS2101_AA1/i));
            userEvent.click(screen.getByTestId(/submit-button/i));

            await act(async () => {
                await flushPromises();
            });

        });

        then("I will receive a list of the following information relating to that interviewer for each call worked on, during the time period specified:", async () => {
            await waitFor(() => {
                expect(screen.findAllByText(/LMS2101_AA1/)).toBeDefined();
                expect(screen.getByText(/1337/)).toBeInTheDocument();
                expect(screen.getByText("01/05/2021 11:00:00")).toBeInTheDocument();
                expect(screen.getByText(/01:01/)).toBeInTheDocument();
                expect(screen.getByText(/Busy/)).toBeInTheDocument();
            });
        });
    });
});
