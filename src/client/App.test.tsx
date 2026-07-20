import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { vi } from "vitest";

import App from "./App";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("./test-utils/authenticate.mock");

  return mockLoginReactClientModule();
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