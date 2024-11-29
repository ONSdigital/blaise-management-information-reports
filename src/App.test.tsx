/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import App from "./App";
import flushPromises from "./tests/utilities";

jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;

describe("management information reports homepage", () => {
    it("matches snapshot", async () => {
        const wrapper = render(<App />, { wrapper: BrowserRouter });

        await act(async () => {
            await flushPromises();
        });

        expect(await wrapper).toMatchSnapshot();
    });

    it("renders correctly", async () => {
        render(<App />, { wrapper: BrowserRouter });

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Management Information Reports/i)).toBeInTheDocument();
            expect(screen.getByText(/Interviewer call history/i)).toBeInTheDocument();
            expect(screen.getByText(/Interviewer call pattern/i)).toBeInTheDocument();
            expect(screen.getByText(/Appointment resource planning/i)).toBeInTheDocument();
        });
    });
});
