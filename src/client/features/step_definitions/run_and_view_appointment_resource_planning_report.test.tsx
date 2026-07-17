import { fireEvent } from "@testing-library/dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";
import React from "react";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import { afterAll, beforeEach, vi } from "vitest";

import App from "../../App";
import { type AppointmentResourcePlanningReportData } from "../../types/interfaces";
import flushPromises from "../../tests/utilities";
import "@testing-library/jest-dom";
import { MockAuthenticate } from "../../test-utils/authenticate.mock";

const mockAdapter = new MockAdapter(axios);
const mockIsProduction = vi.fn();

vi.mock("blaise-login-react-client", async () => {
    const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

    return mockLoginReactClientModule();
});
vi.mock

const feature = loadFeature(
    "./src/client/features/run_and_view_appointment_resource_planning_report.feature",
    { tagFilter: "not @server and not @integration" },
);

const reportDataReturned: AppointmentResourcePlanningReportData[] = [
    {
        questionnaire_name: "LMS2101_AA1",
        appointment_time: "10:00",
        appointment_language: "English",
        case_reference: "123456",
        telephone_number: "012345666666",
        respondent_name: "Jake Peralta",
    },
    {
        questionnaire_name: "LMS2101_BB1",
        appointment_time: "12:30",
        appointment_language: "Welsh",
        case_reference: "123456",
        telephone_number: "012345777777",
        respondent_name: "Harvey Norgenblum",
    },
    {
        questionnaire_name: "LMS2101_CC1",
        appointment_time: "15:15",
        appointment_language: "Other",
        case_reference: "123456",
        telephone_number: "012345888888",
        respondent_name: "Larry Sherbert",
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
        mockAdapter.reset();
        mockAdapter.onPost("/api/reports/appointment-resource-planning-summary").reply(200, ReportSummary);
        mockAdapter.onPost("/api/reports/appointment-resource-planning/").reply(200, reportDataReturned);
        mockAdapter.onPost("/api/appointments/questionnaires").reply(200, questionnairesReturned);
        mockIsProduction.mockReturnValue(false);
        MockAuthenticate.OverrideReturnValues(null, true);
    });

    test("Run and view appointment resource planning report", ({
        given, when, then, and,
    }) => {
        given("A survey tla and date has been specified", async () => {
            render(<App />, { wrapper: BrowserRouter });

            await act(async () => {
                await flushPromises();
            });

            await userEvent.click(screen.getByText("Appointment resource planning"));

            await act(async () => {
                await flushPromises();
            });

            await userEvent.click(screen.getByText("LMS"));

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
            await userEvent.click(screen.getByTestId(/submit-button/i));

            await act(async () => {
                await flushPromises();
            });
        });

        when("I select a questionnaire and click on run report", async () => {
            await userEvent.click(screen.getByLabelText(/LMS2101_AA1/i));
            await userEvent.click(screen.getByTestId(/submit-button/i));

            await act(async () => {
                await flushPromises();
            });
        });

        then("I will receive a list of the following information for appointments made:", async () => {
            await waitFor(() => {
                expect(screen.getByText("Questionnaire")).toBeInTheDocument();
                expect(screen.getByText("Appointment Time")).toBeInTheDocument();
                expect(screen.getByText("Appointment Language")).toBeInTheDocument();
                expect(screen.getByText("Case Reference")).toBeInTheDocument();
                expect(screen.getByText("Telephone Number")).toBeInTheDocument();
                expect(screen.getByText("Respondent Name")).toBeInTheDocument();
                const list = screen.queryAllByTestId(/report-table-row/i);
                const listItemOne = list[0].textContent;

                expect(listItemOne).toEqual("LMS2101_AA110:00English123456012345666666Jake Peralta");
            });
        });

        and("the information will be displayed in time intervals of quarter of an hour, e.g. 09:00, 09:15, 09:30, 09:45, 10:00, 10:15, etc.", async () => {
            expect(screen.getByText("10:00")).toBeInTheDocument();
        });
    });

    test("Run and view appointment resource planning report where telephone numbers and respondent name is not pulled through", ({
        given, when, then, and,
    }) => {
        given("A survey tla and date has been specified", async () => {
            render(<App />, { wrapper: BrowserRouter });

            await act(async () => {
                await flushPromises();
            });

            await userEvent.click(screen.getByText(/Appointment resource planning/i));

            await act(async () => {
                await flushPromises();
            });

            await userEvent.click(screen.getByText("LMS"));

            await act(async () => {
                await flushPromises();
            });

            fireEvent.input(screen.getByLabelText(/Date/i), {
                target: {
                    value: "2021-01-01",
                },
            });
        });

        and("there are no telephone numbers and respondent names pulled through", async () => {
            reportDataReturned[0].telephone_number = null;
            reportDataReturned[0].respondent_name = null;
            mockAdapter.onPost("/api/reports/appointment-resource-planning/").reply(200, reportDataReturned);

            await act(async () => {
                await flushPromises();
            });
        });

        when("I click next to retrieve a list of questionnaires", async () => {
            await userEvent.click(screen.getByTestId(/submit-button/i));

            await act(async () => {
                await flushPromises();
            });
        });

        when("I select a questionnaire and click on run report", async () => {
            await userEvent.click(screen.getByLabelText(/LMS2101_AA1/i));
            await userEvent.click(screen.getByTestId(/submit-button/i));

            await act(async () => {
                await flushPromises();
            });
        });

        then("I will receive a list of the following information for appointments made:", async () => {
            await waitFor(() => {
                expect(screen.getByText("Questionnaire")).toBeInTheDocument();
                expect(screen.getByText("Appointment Time")).toBeInTheDocument();
                expect(screen.getByText("Appointment Language")).toBeInTheDocument();
                expect(screen.getByText("Case Reference")).toBeInTheDocument();
                expect(screen.getByText("Telephone Number")).toBeInTheDocument();
                expect(screen.getByText("Respondent Name")).toBeInTheDocument();
                const list = screen.queryAllByTestId(/report-table-row/i);
                const listItemOne = list[0].textContent;

                expect(listItemOne).toEqual("LMS2101_AA110:00English123456");
            });
        });

        and("the information will be displayed in time intervals of quarter of an hour, e.g. 09:00, 09:15, 09:30, 09:45, 10:00, 10:15, etc.", async () => {
            expect(screen.getByText("10:00")).toBeInTheDocument();
        });
    });
});
