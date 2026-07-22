import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import MockDate from "mockdate";
import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect } from "vitest";

import flushPromises from "../../tests/utilities";

import AppointmentResourcePlanning from "./AppointmentResourcePlanning";

const mockAdapter = new MockAdapter(axios);
const christmasEve97 = "1997-12-24";

describe("appointment resource planning report without data", () => {
  beforeEach(() => {
    MockDate.set(new Date(christmasEve97));
    mockAdapter.onPost("/api/reports/appointment-resource-planning").reply(200, "");
    mockAdapter.onPost("/api/reports/appointment-resource-planning-summary").reply(200, []);
    mockAdapter.onPost("/api/appointments/questionnaires").reply(200, []);
  });

  afterEach(() => {
    MockDate.reset();
    mockAdapter.reset();
  });

  it("matches snapshot", async () => {
    const wrapper = render(
      <MemoryRouter>
        <AppointmentResourcePlanning />
      </MemoryRouter>,
    );

    await act(async () => {
      await flushPromises();
    });

    expect(await wrapper).toMatchSnapshot();
  });
  it("renders correctly", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <AppointmentResourcePlanning />
        </MemoryRouter>,
      );
    });

    const user = userEvent.setup();

    expect(screen.queryByText("Run appointment resource planning report")).toBeVisible();
    expect(
      screen.queryByText("Run a Daybatch first to obtain the most accurate results."),
    ).toBeVisible();
    expect(
      screen.queryByText("Appointments that have already been attempted will not be displayed."),
    ).toBeVisible();

    expect(screen.queryByText("Select survey")).toBeVisible();
    expect(screen.queryByText("Show all surveys")).toBeVisible();
    expect(screen.queryByText("LMS")).toBeVisible();
    expect(screen.queryByText("Labour Market Survey")).toBeVisible();
    expect(screen.queryByText("OPN")).toBeVisible();
    expect(screen.queryByText("Opinions and Lifestyle Survey")).toBeVisible();

    expect(screen.queryByText("Date")).toBeVisible();

    const dateInput = screen.getByLabelText(/Date/i);

    await user.clear(dateInput);
    fireEvent.change(dateInput, {
      target: {
        value: "2021-01-01",
      },
    });

    await user.click(screen.getByTestId(/submit-button/i));

    await act(async () => {
      await flushPromises();
    });
    expect(await screen.getByText("No questionnaires found for given parameters.")).toBeVisible();
  });
});
