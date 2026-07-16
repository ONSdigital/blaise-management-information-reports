import "@testing-library/jest-dom";
import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import MockDate from "mockdate";
import React from "react";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";

import flushPromises from "../../test-utils/flushPromises";

import SurveyInterviewerStartDateEndDateForm from "./SurveyInterviewerStartDateEndDateForm";

const christmasEve97 = "1997-12-24";

describe("form - survey, interviewer, start date, end date", () => {
  beforeEach(() => {
    MockDate.set(new Date(christmasEve97));
  });

  afterEach(() => {
    MockDate.reset();
  });

  it("matches snapshot", async () => {
    const wrapper = render(
      <MemoryRouter>
        <SurveyInterviewerStartDateEndDateForm
          interviewer=""
          surveyTLA=""
          startDate={new Date()}
          endDate={new Date()}
          onSubmit={() => true}
        />
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
          <SurveyInterviewerStartDateEndDateForm
            interviewer=""
            surveyTLA=""
            startDate={new Date()}
            endDate={new Date()}
            onSubmit={() => true}
          />
        </MemoryRouter>,
      );
    });
    expect(screen.queryByText("Select survey")).toBeVisible();
    expect(screen.queryByText("Show all surveys")).toBeVisible();
    expect(screen.queryByText("LMS")).toBeVisible();
    expect(screen.queryByText("Labour Market Survey")).toBeVisible();
    expect(screen.queryByText("OPN")).toBeVisible();
    expect(screen.queryByText("Opinions and Lifestyle Survey")).toBeVisible();
    expect(screen.queryByText("Interviewer ID")).toBeVisible();
    expect(screen.queryByText("Start date")).toBeVisible();
    expect(screen.queryByText("End date")).toBeVisible();
    expect(screen.queryByText("Next")).toBeVisible();
  });
});
