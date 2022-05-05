/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import {createMemoryHistory} from "history";
import {cleanup, render, waitFor} from "@testing-library/react";
import {Router} from "react-router";
import {act} from "react-dom/test-utils";
import {screen} from "@testing-library/dom";
import React, {useState} from "react";
import InterviewerFilter from "./InterviewerFilter";

describe("the interviewer details page renders correctly", () => {
    it("matches snapshot", async () => {
        const history = createMemoryHistory();

        const wrapper = render(
            <Router history={history}>
                <InterviewerFilter title=""
                                   interviewer={"James"} setInterviewer={() => {
                    return;
                }}
                                   startDate={new Date("2021-01-01")} setStartDate={() => {
                    return;
                }}
                                   endDate={new Date("2021-01-05")} setEndDate={() => {
                    return;
                }}
                                   surveyTla={"LMS"} setSurveyTla={() => {
                    return;
                }}
                                   submitFunction={() => {
                                       return true;
                                   }}/>
            </Router>
        );

        jest.useRealTimers();
        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("renders correctly", async () => {
        const history = createMemoryHistory();

        await act(async () => {
            render(
                <Router history={history}>
                    <InterviewerFilter title=""
                                       interviewer={"James"} setInterviewer={() => {return;}}
                                       startDate={new Date("2021-01-01")} setStartDate={() => {return;}}
                                       endDate={new Date("2021-01-05")} setEndDate={() => {return;}}
                                       surveyTla={"LMS"} setSurveyTla={() => {return;}}
                                       submitFunction={() => {return true;}}/>
                </Router>
            );
        });

        expect(screen.queryByText(/Run interviewer/i)).toBeVisible();
        expect(screen.queryByText(/Data in this report was last updated:/i)).toBeVisible();

        expect(screen.queryByText(/Select survey/i)).toBeVisible();
        expect(screen.queryByText(/Show all surveys/i)).toBeVisible();
        expect(screen.queryByText(/LMS/i)).toBeVisible();
        expect(screen.queryByText(/OPN/i)).toBeVisible();

        expect(screen.queryByText(/Interviewer ID/i)).toBeVisible();

        expect(screen.queryByText(/Start date/i)).toBeVisible();
        expect(screen.queryByText(/End date/i)).toBeVisible();
    });

    afterAll(() => {
        cleanup();
    });
});
