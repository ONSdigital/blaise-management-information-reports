/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import InterviewerCallPattern, {
    callStatusSection,
    formatToFractionAndPercentage,
    invalidFieldsGroup,
    isAllInvalid,
    noContactBreakdownSection
} from "./RenderInterviewerCallPatternReport";
import { InterviewerCallPatternReport } from "../../interfaces";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import MockDate from "mockdate";
import { createMemoryHistory } from "history";
import { render } from "@testing-library/react";
import { Router } from "react-router";
import React from "react";
import { act } from "react-dom/test-utils";
import flushPromises from "../../tests/utilities";
import { screen } from "@testing-library/dom";

const mockAdapter = new MockAdapter(axios);

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
    no_contact_invalid_telephone_number: 5,
    invalid_fields: "'status' column had timed out call status,'call_end_time' column had missing data",
    total_records: 133 + 29,
};

const mockDataWithOnlyInvalidCases: InterviewerCallPatternReport = {
    discounted_invalid_cases: 100,
    invalid_fields: "'status' column had timed out call status,'call_end_time' column had missing data"
};

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
    no_contact_invalid_telephone_number: 5,
    invalid_fields: "n/a",
    discounted_invalid_cases: 0,
};

const mockProps = {
    interviewer: "thorne1",
    startDate: new Date(2022, 12, 31),
    endDate: new Date(2023, 12, 31),
    surveyTla: "foo",
    questionnaires: ["foo"],
    navigateBack: jest.fn(),
    navigateBackTwoSteps: jest.fn(),
};

const threeDaysFromTheNewMillennium = "2000-01-03";

describe("function formatToFractionAndPercentage()", () => {
    it("should return a string demonstrating the total and percentage", () => {
        const actual = formatToFractionAndPercentage(1, 2);
        expect(actual).toEqual("1/2, 50.00%");
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
                "invalid_telephone_number": "5/11, 45.45%"
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
    beforeEach(() => {
        mockAdapter.onPost("/api/reports/interviewer-call-pattern").reply(
            200, mockData
        );
        mockAdapter.onGet("/api/reports/call-history-status").reply(
            200, { "last_updated": "Tue, 01 Jan 2000 10:00:00 GMT" }
        );
        MockDate.set(new Date(threeDaysFromTheNewMillennium));
    });

    afterEach(() => {
        MockDate.reset();
        mockAdapter.reset();
    });

    it("should match the snapshot", async () => {
        const history = createMemoryHistory();

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallPattern
                    interviewer={mockProps.interviewer}
                    startDate={mockProps.startDate}
                    endDate={mockProps.endDate}
                    surveyTla={mockProps.surveyTla}
                    questionnaires={mockProps.questionnaires}
                    navigateBack={mockProps.navigateBack}
                    navigateBackTwoSteps={mockProps.navigateBackTwoSteps}
                />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await screen.findByText("Questionnaires");

        expect(await wrapper).toMatchSnapshot();
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <InterviewerCallPattern
                    interviewer={mockProps.interviewer}
                    startDate={mockProps.startDate}
                    endDate={mockProps.endDate}
                    surveyTla={mockProps.surveyTla}
                    questionnaires={mockProps.questionnaires}
                    navigateBack={mockProps.navigateBack}
                    navigateBackTwoSteps={mockProps.navigateBackTwoSteps}
                />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        expect(await screen.findByText("Reports")).toBeVisible();
        expect(screen.getByText("Interviewer details")).toBeVisible();
        expect(screen.getByText("Call Pattern Report")).toBeVisible();
        expect(screen.getByText(/Interviewer:/)).toBeVisible();
        expect(screen.getByText(/Data in this report was last updated:/i)).toBeVisible();
        expect(screen.getByText(/2 days ago/i)).toBeVisible();
        expect(screen.getByText("Data in this report only goes back to the last 12 months.")).toBeVisible();
        expect(screen.getByText("Incomplete data is removed from this report. This will impact the accuracy of the report.")).toBeVisible();
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
        expect(screen.getAllByText("4/11, 36.36%")[0]).toBeVisible();
        expect(screen.getByText("Busy")).toBeVisible();
        expect(screen.getByText("1/11, 9.09%")).toBeVisible();
        expect(screen.getByText("Disconnect")).toBeVisible();
        expect(screen.getByText("2/11, 18.18%")).toBeVisible();
        expect(screen.getByText("No answer")).toBeVisible();
        expect(screen.getByText("3/11, 27.27%")).toBeVisible();
        expect(screen.getByText("Other")).toBeVisible();
        expect(screen.getAllByText("4/11, 36.36%")[1]).toBeVisible();
        expect(screen.getByText("Invalid telephone number")).toBeVisible();
        expect(screen.getByText("5/11, 45.45%")).toBeVisible();

        expect(screen.queryByText(/were discounted due to the following invalid fields/i)).not.toBeInTheDocument();
    });
});

describe("function InterviewerCallPattern() with data and invalid data", () => {
    beforeEach(() => {
        mockAdapter.onPost("/api/reports/interviewer-call-pattern").reply(
            200, mockDataWithInvalidCases
        );
        mockAdapter.onGet("/api/reports/call-history-status").reply(
            200, { "last_updated": "Tue, 01 Jan 2000 10:00:00 GMT" }
        );
        MockDate.set(new Date(threeDaysFromTheNewMillennium));
    });

    afterEach(() => {
        MockDate.reset();
        mockAdapter.reset();
    });

    it("should match the snapshot", async () => {
        const history = createMemoryHistory();

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallPattern
                    interviewer={mockProps.interviewer}
                    startDate={mockProps.startDate}
                    endDate={mockProps.endDate}
                    surveyTla={mockProps.surveyTla}
                    questionnaires={mockProps.questionnaires}
                    navigateBack={mockProps.navigateBack}
                    navigateBackTwoSteps={mockProps.navigateBackTwoSteps}
                />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await screen.findByText("Questionnaires");

        expect(await wrapper).toMatchSnapshot();
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();

        await act(async () => {
            render(
                <Router history={history}>
                    <InterviewerCallPattern
                        interviewer={mockProps.interviewer}
                        startDate={mockProps.startDate}
                        endDate={mockProps.endDate}
                        surveyTla={mockProps.surveyTla}
                        questionnaires={mockProps.questionnaires}
                        navigateBack={mockProps.navigateBack}
                        navigateBackTwoSteps={mockProps.navigateBackTwoSteps}
                    />
                </Router>
            );
        });

        await screen.findByText("Questionnaires");

        expect(screen.queryByText("Reports")).toBeVisible();
        expect(screen.queryByText("Interviewer details")).toBeVisible();
        expect(screen.queryByText("Call Pattern Report")).toBeVisible();
        expect(screen.queryByText(/Interviewer:/)).toBeVisible();
        expect(screen.queryByText(/Data in this report was last updated:/i)).toBeVisible();
        expect(screen.queryByText(/2 days ago/i)).toBeVisible();
        expect(screen.queryByText("Data in this report only goes back to the last 12 months.")).toBeVisible();
        expect(screen.queryByText("Incomplete data is removed from this report. This will impact the accuracy of the report.")).toBeVisible();
        expect(screen.getByText("Export report as Comma-Separated Values (CSV) file")).toBeVisible();

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
        expect(screen.getByText("Invalid telephone number")).toBeVisible();
        expect(screen.getByText("5/11, 45.45%")).toBeVisible();

        expect(screen.getByText(/were discounted due to the following invalid fields/i)).toBeVisible();
    });
});

describe("function InterviewerCallPattern() without data", () => {
    beforeEach(() => {
        mockAdapter.onPost("/api/reports/interviewer-call-pattern").reply(
            200, {}
        );
        mockAdapter.onGet("/api/reports/call-history-status").reply(
            200, {}
        );
        MockDate.set(new Date(threeDaysFromTheNewMillennium));
    });

    afterEach(() => {
        MockDate.reset();
        mockAdapter.reset();
    });

    it("should match the snapshot", async () => {
        const history = createMemoryHistory();

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallPattern
                    interviewer={mockProps.interviewer}
                    startDate={mockProps.startDate}
                    endDate={mockProps.endDate}
                    surveyTla={mockProps.surveyTla}
                    questionnaires={mockProps.questionnaires}
                    navigateBack={mockProps.navigateBack}
                    navigateBackTwoSteps={mockProps.navigateBackTwoSteps}
                />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await screen.findByText("Questionnaires");

        expect(await wrapper).toMatchSnapshot();
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();

        await act(async () => {
            render(
                <Router history={history}>
                    <InterviewerCallPattern
                        interviewer={mockProps.interviewer}
                        startDate={mockProps.startDate}
                        endDate={mockProps.endDate}
                        surveyTla={mockProps.surveyTla}
                        questionnaires={mockProps.questionnaires}
                        navigateBack={mockProps.navigateBack}
                        navigateBackTwoSteps={mockProps.navigateBackTwoSteps}
                    />
                </Router>
            );
        });

        expect(await screen.findByText(/Interviewer:/)).toBeVisible();
        expect(await screen.findByText(/Period:/)).toBeVisible();
        expect(await screen.findByText(/Data in this report was last updated:/)).toBeVisible();
        expect(await screen.findByText("Data in this report only goes back to the last 12 months.")).toBeVisible();
        expect(await screen.findByText("No data found for parameters given.")).toBeVisible();
    });
});

describe("function InterviewerCallPattern() with only invalid data", () => {
    beforeEach(() => {
        mockAdapter.onPost("/api/reports/interviewer-call-pattern").reply(
            200, mockDataWithOnlyInvalidCases
        );
        mockAdapter.onGet("/api/reports/call-history-status").reply(
            200, { "last_updated": "Tue, 01 Jan 2000 10:00:00 GMT" }
        );
        MockDate.set(new Date(threeDaysFromTheNewMillennium));
    });

    afterEach(() => {
        MockDate.reset();
        mockAdapter.reset();
    });

    it("should match the snapshot", async () => {
        const history = createMemoryHistory();

        const wrapper = render(
            <Router history={history}>
                <InterviewerCallPattern
                    interviewer={mockProps.interviewer}
                    startDate={mockProps.startDate}
                    endDate={mockProps.endDate}
                    surveyTla={mockProps.surveyTla}
                    questionnaires={mockProps.questionnaires}
                    navigateBack={mockProps.navigateBack}
                    navigateBackTwoSteps={mockProps.navigateBackTwoSteps}
                />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        expect(await screen.findByText("Reports")).toBeVisible();

        expect(await wrapper).toMatchSnapshot();
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();

        await act(async () => {
            render(
                <Router history={history}>
                    <InterviewerCallPattern
                        interviewer={mockProps.interviewer}
                        startDate={mockProps.startDate}
                        endDate={mockProps.endDate}
                        surveyTla={mockProps.surveyTla}
                        questionnaires={mockProps.questionnaires}
                        navigateBack={mockProps.navigateBack}
                        navigateBackTwoSteps={mockProps.navigateBackTwoSteps}
                    />
                </Router>
            );
        });

        expect(await screen.findByText("Reports")).toBeVisible();
        expect(screen.getByText("Interviewer details")).toBeVisible();
        expect(screen.getByText("Call Pattern Report")).toBeVisible();
        expect(screen.getByText(/Interviewer:/)).toBeVisible();
        expect(screen.getByText(/Data in this report was last updated:/i)).toBeVisible();
        expect(screen.getByText(/2 days ago/i)).toBeVisible();
        expect(screen.getByText("Data in this report only goes back to the last 12 months.")).toBeVisible();
        expect(screen.getByText("Incomplete data is removed from this report. This will impact the accuracy of the report.")).toBeVisible();

        expect(screen.queryByText("Export report as Comma-Separated Values (CSV) file")).not.toBeVisible();
        expect(screen.queryByText("Call times")).not.toBeInTheDocument();
        expect(screen.queryByText("Call status")).not.toBeInTheDocument();
        expect(screen.queryByText("Breakdown of no Contact calls")).not.toBeInTheDocument();
        expect(screen.queryByText("Invalid Fields")).not.toBeInTheDocument();

        expect(screen.getByText(/Information: 100\/100 records \(100.00%\) were discounted due to the following invalid fields:/i)).toBeVisible();
    });
});

