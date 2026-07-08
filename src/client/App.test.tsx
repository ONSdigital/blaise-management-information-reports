import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import App from "./App";
import { vi } from "vitest"

vi.mock("blaise-login-react-client", async () => {
    const actual = await vi.importActual<any>(
        "blaise-login-react-client"
    );

    return {
        ...actual,
        Authenticate: actual.MockAuthenticate,
    };
});

describe("management information reports homepage", () => {
    it("matches snapshot", async () => {
        const wrapper = render(<App />, { wrapper: BrowserRouter });

        expect(await wrapper).toMatchSnapshot();
    });

    it("renders correctly", async () => {
        render(<App />, { wrapper: BrowserRouter });

        await waitFor(() => {
            expect(screen.getByText(/Management Information Reports/i)).toBeInTheDocument();
            expect(screen.getByText(/Interviewer call history/i)).toBeInTheDocument();
            expect(screen.getByText(/Interviewer call pattern/i)).toBeInTheDocument();
            expect(screen.getByText(/Appointment resource planning/i)).toBeInTheDocument();
        });
    });
});
