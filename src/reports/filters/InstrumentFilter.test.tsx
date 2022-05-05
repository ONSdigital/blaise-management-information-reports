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
import InstrumentFilter from "./InstrumentFilter";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import flushPromises from "../../tests/utilities";

const mockAdapter = new MockAdapter(axios);

const instrumentDataReturned: string[] = [
    "LMS2101_AA1"
];

describe("the interviewer details page renders correctly", () => {
    it("matches snapshot", async () => {
        const history = createMemoryHistory();

        mockAdapter.onPost("/api/instruments").reply(200, instrumentDataReturned);

        const wrapper = render(
            <Router history={history}>
                <InstrumentFilter interviewer={"James"}
                                  startDate={new Date("2022-01-01")}
                                  endDate={new Date("2022-01-05")}
                                  surveyTla={"LMS"}
                                  instruments={["LMS2101_AA1"]} setInstruments={() => {return;}}
                                  submitFunction={() => {return;}}
                                  navigateBack={() => {return;}}/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

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
                    <InstrumentFilter interviewer={"James"}
                                      startDate={new Date("2021-01-01")}
                                      endDate={new Date("2021-01-05")}
                                      surveyTla={"LMS"}
                                      instruments={["LMS2101_AA1"]} setInstruments={() => {return;}}
                                      submitFunction={() => {return;}}
                                      navigateBack={() => {return;}}/>
                </Router>
            );
        });

        expect(screen.queryByText(/Select questionnaire/i)).toBeVisible();
        expect(screen.queryByText(/Data in this report was last updated:/i)).toBeVisible();

        expect(screen.queryByText(/LMS2101_AA1/i)).toBeVisible();
        expect(screen.queryByText(/Run report/i)).toBeVisible();
    });

    afterAll(() => {
        cleanup();
    });
});
