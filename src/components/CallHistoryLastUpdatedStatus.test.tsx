/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { createMemoryHistory } from "history";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { act } from "react-dom/test-utils";
import { screen } from "@testing-library/dom";
import React from "react";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import timekeeper from "timekeeper";
import CallHistoryLastUpdatedStatus from "./CallHistoryLastUpdatedStatus";
import flushPromises from "../tests/utilities";

const mockAdapter = new MockAdapter(axios);

describe("CallHistoryLastUpdatedStatus component", () => {
    beforeAll(() => {
        timekeeper.freeze(new Date("2014-01-01"));
    });

    afterAll(() => {
        timekeeper.reset();
    });

    it("matches snapshot", async () => {
        mockAdapter
            .onGet("/api/reports/call-history-status")
            .reply(200, { last_updated: "Sat, 01 Jan 2000 10:00:00 GMT" });

        const history = createMemoryHistory();
        const wrapper = render(
            <MemoryRouter history={history}>
                <CallHistoryLastUpdatedStatus />
            </MemoryRouter>,
        );

        await act(async () => {
            await flushPromises();
        });

        expect(await wrapper).toMatchSnapshot();
    });
    it("renders correctly", async () => {
        mockAdapter
            .onGet("/api/reports/call-history-status")
            .reply(200, { last_updated: "Sat, 01 Jan 2000 10:00:00 GMT" });

        const history = createMemoryHistory();

        await act(async () => {
            render(
                <MemoryRouter history={history}>
                    <CallHistoryLastUpdatedStatus />
                </MemoryRouter>,
            );
        });

        expect(screen.queryByText("Data in this report was last updated:")).toBeVisible();
        expect(screen.queryByText("Data in this report only goes back to the last 12 months.")).toBeVisible();

        await act(async () => {
            await flushPromises();
        });

        expect(await screen.findByText("14 years ago")).toBeVisible();
    });
});

describe("call history last updated status with invalid data", () => {
    beforeEach(() => {
        mockAdapter.onGet("/api/reports/call-history-status").reply(200, "blah");
    });

    afterEach(() => {
        mockAdapter.reset();
    });

    it("matches snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <MemoryRouter history={history}>
                <CallHistoryLastUpdatedStatus />
            </MemoryRouter>,
        );
        await act(async () => {
            await flushPromises();
        });

        expect(await wrapper).toMatchSnapshot();
    });

    it("renders correctly", async () => {
        const history = createMemoryHistory();
        await act(async () => {
            render(
                <MemoryRouter history={history}>
                    <CallHistoryLastUpdatedStatus />
                </MemoryRouter>,
            );
        });
        expect(screen.queryByText("Data in this report was last updated:")).toBeVisible();
        expect(screen.queryByText("Data in this report only goes back to the last 12 months.")).toBeVisible();
        await act(async () => {
            await flushPromises();
        });

        expect(await screen.findByText("Invalid Date")).toBeVisible();
    });
});
