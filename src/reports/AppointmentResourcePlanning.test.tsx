import {AppointmentResourcePlanningReportData} from "../interfaces";
import "@testing-library/jest-dom";
import flushPromises, {mock_fetch_requests} from "../tests/utilities";
import {createMemoryHistory} from "history";
import {cleanup, render, waitFor} from "@testing-library/react";
import {Router} from "react-router";
import AppointmentResourcePlanning from "./AppointmentResourcePlanning";
import {act} from "react-dom/test-utils";
import {fireEvent, screen} from "@testing-library/dom";
import React from "react";
import MockDate from "mockdate";

const ReportSummary = [
    {language: "English", total: 1},
    {language: "Welsh", total: 1},
    {language: "Other", total: 1},
];

const reportDataReturned: AppointmentResourcePlanningReportData[] = [
    {
        questionnaire_name: "LMS2101_AA1",
        appointment_time: "10:00",
        appointment_language: "English",
        total: 42
    },
    {
        questionnaire_name: "LMS2101_BB1",
        appointment_time: "12:30",
        appointment_language: "Welsh",
        total: 1908
    },
    {
        questionnaire_name: "LMS2101_CC1",
        appointment_time: "15:15",
        appointment_language: "Other",
        total: 408
    }
];

const mock_server_response_with_data = (url: string) => {
    console.log(url);
    if (url.includes("/api/reports/appointment-resource-planning-summary")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(ReportSummary),
        });
    }
    return Promise.resolve({
        status: 200,
        json: () => Promise.resolve(reportDataReturned),
    });
};

const mock_server_response_without_data = (url: string) => {
    if (url.includes("/api/reports/appointment-resource-planning-summary")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve([]),
        });
    }
    return Promise.resolve({
        status: 200,
        json: () => Promise.resolve(""),
    });

};

const christmasEve97 = "1997-12-24";

describe("appointment resource planning report with data", () => {
    afterEach(() => {
        MockDate.reset();
    });

    beforeEach(() => {
        mock_fetch_requests(mock_server_response_with_data);
        MockDate.set(new Date(christmasEve97));
    });

    it("matches snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <AppointmentResourcePlanning/>
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
                    <AppointmentResourcePlanning/>
                </Router>
            );
        });
        expect(screen.queryByText("Run appointment resource planning report")).toBeVisible();
        expect(screen.queryByText("Run a Daybatch first to obtain the most accurate results.")).toBeVisible();
        expect(screen.queryByText("Appointments that have already been attempted will not be displayed.")).toBeVisible();
        expect(screen.queryByText("Date")).toBeVisible();
        fireEvent.input(screen.getByLabelText(/Date/i), {
            target: {
                value:
                    "2021-01-01"
            }
        });
        fireEvent.click(screen.getByTestId(/submit-button/i));
        await act(async () => {
            await flushPromises();
        });
        await waitFor(() => {
            const list = screen.queryAllByTestId(/report-table-row/i);
            const listItemOne = list[0].textContent;
            expect(listItemOne).toEqual("LMS2101_AA110:00English42");
            const listItemTwo = list[1].textContent;
            expect(listItemTwo).toEqual("LMS2101_BB112:30Welsh1908");
            const listItemThree = list[2].textContent;
            expect(listItemThree).toEqual("LMS2101_CC115:15Other408");

            expect(screen.queryByText("Appointment language summary")).toBeVisible();
            expect(screen.getByText("Export report as Comma-Separated Values (CSV) file")).toBeVisible();
            expect(screen.getByText("Questionnaire")).toBeVisible();
            expect(screen.getByText("Appointment Time")).toBeVisible();
            expect(screen.getByText("Appointment Language")).toBeVisible();
        });
    });
    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("appointment resource planning report without data", () => {
    afterEach(() => {
        MockDate.reset();
    });

    beforeEach(() => {
        mock_fetch_requests(mock_server_response_without_data);
        MockDate.set(new Date(christmasEve97));
    });

    it("matches snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <AppointmentResourcePlanning/>
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
                    <AppointmentResourcePlanning/>
                </Router>
            );
        });
        expect(screen.queryByText("Run appointment resource planning report")).toBeVisible();
        expect(screen.queryByText("Run a Daybatch first to obtain the most accurate results.")).toBeVisible();
        expect(screen.queryByText("Appointments that have already been attempted will not be displayed.")).toBeVisible();
        expect(screen.queryByText("Date")).toBeVisible();
        fireEvent.input(screen.getByLabelText(/Date/i), {
            target: {
                value:
                    "2021-01-01"
            }
        });
        fireEvent.click(screen.getByTestId(/submit-button/i));
        await act(async () => {
            await flushPromises();
        });
        await waitFor(() => {
            expect(screen.queryByText("No data found for parameters given.")).toBeVisible();
        });
    });
    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
