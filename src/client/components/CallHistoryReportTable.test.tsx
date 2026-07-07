import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import React from "react";
import { screen } from "@testing-library/dom";
import CallHistoryReportTable from "./CallHistoryReportTable";
import { InterviewerCallHistoryReport } from "../interfaces";

const reportData: InterviewerCallHistoryReport = {
    call_result: "Appointment",
    dial_secs: 90,
    questionnaire_name: "LMS2101_AA1",
    serial_number: "900001",
    call_start_time: "2022-01-31T09:00-0000",
    outcome_code: "320",
};
const messageNoData = "No data found for parameters given.";

describe("CallHistoryReportTable", () => {
    it("matches snapshot", async () => {
        const wrapper = render(
            <CallHistoryReportTable messageNoData={messageNoData} reportData={[reportData]} />,
        );
        expect(await wrapper).toMatchSnapshot();
    });

    it("displays a heading of 'Questionnaire'", async () => {
        render(
            <CallHistoryReportTable messageNoData={messageNoData} reportData={[reportData]} />,
        );
        expect(screen.queryByText("Questionnaire")).toBeVisible();
    });

    it("displays a heading of 'Serial number'", async () => {
        render(
            <CallHistoryReportTable messageNoData={messageNoData} reportData={[reportData]} />,
        );
        expect(screen.queryByText("Serial Number")).toBeVisible();
    });

    it("displays a heading of 'Call Start Time'", async () => {
        render(
            <CallHistoryReportTable messageNoData={messageNoData} reportData={[reportData]} />,
        );
        expect(screen.queryByText("Call Start Time")).toBeVisible();
    });

    it("displays a heading of 'Call Length'", async () => {
        render(
            <CallHistoryReportTable messageNoData={messageNoData} reportData={[reportData]} />,
        );
        expect(screen.queryByText("Call Length")).toBeVisible();
    });

    it("displays a heading of 'Call Result'", async () => {
        render(
            <CallHistoryReportTable messageNoData={messageNoData} reportData={[reportData]} />,
        );
        expect(screen.queryByText("Call Result")).toBeVisible();
    });

    it("displays a heading of 'Outcome Code'", async () => {
        render(
            <CallHistoryReportTable messageNoData={messageNoData} reportData={[reportData]} />,
        );
        expect(screen.queryByText("Outcome Code")).toBeVisible();
    });

    it("displays the relevant information for each heading", async () => {
        render(
            <CallHistoryReportTable messageNoData={messageNoData} reportData={[reportData]} />,
        );
        expect(screen.queryByText("LMS2101_AA1")).toBeVisible();
        expect(screen.queryByText("900001")).toBeVisible();
        expect(screen.queryByText("31/01/2022 09:00:00")).toBeVisible();
        expect(screen.queryByText("01:30")).toBeVisible();
        expect(screen.queryByText("Appointment")).toBeVisible();
        expect(screen.queryByText("320")).toBeVisible();
    });
});
