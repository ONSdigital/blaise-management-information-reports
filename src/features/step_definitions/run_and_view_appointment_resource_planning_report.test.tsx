/**
 * @jest-environment jsdom
 */

import { defineFeature, loadFeature } from "jest-cucumber";
import { createMemoryHistory } from "history";
import { render, screen, waitFor } from "@testing-library/react";
import { Router } from "react-router-dom";
import React from "react";
import { fireEvent } from "@testing-library/dom";
import { act } from "react-dom/test-utils";
import { AuthManager } from "blaise-login-react-client";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import userEvent from "@testing-library/user-event";
import { AppointmentResourcePlanningReportData } from "../../interfaces";
import flushPromises from "../../tests/utilities";
import App from "../../App";
import "@testing-library/jest-dom";

const mockAdapter = new MockAdapter(axios);

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => Promise.resolve(true));

const feature = loadFeature(
    "./src/features/run_and_view_appointment_resource_planning_report.feature",
    { tagFilter: "not @server and not @integration" },
);

const reportDataReturned: AppointmentResourcePlanningReportData[] = [
    {
        questionnaire_name: "LMS2101_AA1",
        appointment_time: "10:00",
        appointment_language: "English",
    },
    {
        questionnaire_name: "LMS2101_BB1",
        appointment_time: "12:30",
        appointment_language: "Welsh",
    },
    {
        questionnaire_name: "LMS2101_CC1",
        appointment_time: "15:15",
        appointment_language: "Other",
    },
];

const ReportSummary = [
    { language: "English", total: 1 },
    { language: "Welsh", total: 1 },
    { language: "Other", total: 1 },
];

const questionnairesReturned = ["LMS2101_AA1", "LMS2101_BB1", "LMS2101_CC1"];

defineFeature(feature, (test) => {
    beforeEach(() => {
        mockAdapter.onPost("/api/reports/appointment-resource-planning-summary").reply(200, ReportSummary);
        mockAdapter.onPost("/api/reports/appointment-resource-planning/").reply(200, reportDataReturned);
        mockAdapter.onPost("/api/appointments/questionnaires").reply(200, questionnairesReturned);
    });

    afterEach(() => {
        mockAdapter.reset();
    });

    test("Run and view appointment resource planning report", ({
        given, when, then, and,
    }) => {
        given("A survey tla and date has been specified", async () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App />
                </Router>,
            );

            await act(async () => {
                await flushPromises();
            });

            userEvent.click(screen.getByText("Appointment resource planning"));

            await act(async () => {
                await flushPromises();
            });

            userEvent.click(screen.getByText("LMS"));

            await act(async () => {
                await flushPromises();
            });

            fireEvent.input(screen.getByLabelText(/Date/i), {
                target: {
                    value: "2021-01-01",
                },
            });
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

        then("I will receive a list of the following information for appointments made:", async () => {
            await waitFor(() => {
                expect(screen.getByText("Questionnaire")).toBeInTheDocument();
                expect(screen.getByText("Appointment Time")).toBeInTheDocument();
                expect(screen.getByText("Appointment Language")).toBeInTheDocument();

                const list = screen.queryAllByTestId(/report-table-row/i);
                const listItemOne = list[0].textContent;
                expect(listItemOne).toEqual("LMS2101_AA110:00English");
            });
        });

        and("the information will be displayed in time intervals of quarter of an hour, e.g. 09:00, 09:15, 09:30, 09:45, 10:00, 10:15, etc.", async () => {
            expect(screen.getByText("10:00")).toBeInTheDocument();
        });
    });
});
