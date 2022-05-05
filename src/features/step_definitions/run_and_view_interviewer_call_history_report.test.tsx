/**
 * @jest-environment jsdom
 */

import {defineFeature, loadFeature} from "jest-cucumber";
import {createMemoryHistory} from "history";
import {cleanup, render, screen, waitFor} from "@testing-library/react";
import {Router} from "react-router-dom";
import App from "../../App";
import React from "react";
import {act} from "react-dom/test-utils";
import flushPromises from "../../tests/utilities";
import {InterviewerCallHistoryReport} from "../../interfaces";
import userEvent from "@testing-library/user-event";
import {AuthManager} from "blaise-login-react-client";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mockAdapter = new MockAdapter(axios);

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});


const feature = loadFeature(
    "./src/features/run_and_view_interviewer_call_history_report.feature",
    {tagFilter: "not @server and not @integration"}
);

const reportDataReturned: InterviewerCallHistoryReport[] = [
    {
        questionnaire_name: "LMS2101_AA1",
        serial_number: "1337",
        call_start_time: "Sat, 01 May 2021 10:00:00 GMT",
        dial_secs: 61,
        call_result: "Busy",
    }];

const instrumentDataReturned: string[] = [
    "LMS2101_AA1"
];


defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        cleanup();
    });

    beforeEach(() => {
        cleanup();
        mockAdapter.reset();

        mockAdapter.onPost("/api/instruments").reply(200, instrumentDataReturned);
        mockAdapter.onPost("/api/reports/interviewer-call-history").reply(200, reportDataReturned);
        mockAdapter.onGet("/api/reports/call-history-status").reply(200,
            {"last_updated": "Fri, 28 May 2021 10:00:00 GMT"});
    });

    test("Run and view interviewer call history report", ({given, when, then}) => {
        given("An interviewer ID and time period (start date and end date) has been specified", async () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
                </Router>
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

        when("I click next to retrieve a list of instruments", async () => {
            userEvent.click(screen.getByTestId(/submit-button/i));

            await act(async () => {
                await flushPromises();
            });
        });

        when("I select an instrument and click on run report", async () => {
            userEvent.click(screen.getByLabelText(/LMS2101_AA1/i));
            userEvent.click(screen.getByTestId(/submit-button/i));

            await act(async () => {
                await flushPromises();
            });

        });

        then("I will receive a list of the following information relating to that interviewer for each call worked on, during the time period specified:", async (docString) => {
            await waitFor(() => {
                expect(screen.findAllByText(/LMS2101_AA1/)).toBeDefined();
                expect(screen.getByText(/1337/)).toBeDefined();
                expect(screen.getByText("01/05/2021 11:00:00")).toBeDefined();
                expect(screen.getByText(/01:01/)).toBeDefined();
                expect(screen.getByText(/Busy/)).toBeDefined();
            });
        });
    });
});
