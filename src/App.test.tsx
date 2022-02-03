/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import App from "./App";
import "@testing-library/jest-dom";
import flushPromises from "./tests/utilities";
import { act } from "react-dom/test-utils";
import { createMemoryHistory } from "history";
import { Router } from "react-router";
import { AuthManager } from "blaise-login-react-client";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

describe("management information reports homepage", () => {
    it("matches snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <App />
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
        const { queryByText } = render(
            <Router history={history}>
                <App />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        expect(queryByText(/Management Information Reports/)).toBeInTheDocument();
        expect(queryByText(/Interviewer call history/)).toBeInTheDocument();
        expect(queryByText(/Interviewer call pattern/)).toBeInTheDocument();
        expect(queryByText(/Appointment resource planning/)).toBeInTheDocument();
    });
});
