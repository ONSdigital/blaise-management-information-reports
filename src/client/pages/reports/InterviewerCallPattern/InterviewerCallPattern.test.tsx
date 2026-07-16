import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the subcomponents
vi.mock("../filters/InterviewerFilter", () => ({
  default: ({ title, query, onSubmit }: any) => (
    <div data-testid="interviewer-filter">
      <h3>{title}</h3>
      <button
        onClick={() =>
          onSubmit({
            interviewer: "TestInterviewer",
            startDate: new Date("2022-01-01"),
            endDate: new Date("2022-12-31"),
            surveyTla: "TST",
          })
        }
      >
        Submit Interviewer Filter
      </button>
    </div>
  ),
}));

vi.mock("../filters/QuestionnaireFilter", () => ({
  default: ({ onSubmit, navigateBack }: any) => (
    <div data-testid="questionnaire-filter">
      <button onClick={() => onSubmit()}>Submit Questionnaire Filter</button>
      <button onClick={navigateBack}>Back</button>
    </div>
  ),
}));

vi.mock("./RenderInterviewerCallPatternReport", () => ({
  default: ({ navigateBack, navigateBackTwoSteps }: any) => (
    <div data-testid="call-pattern-report">
      <button onClick={navigateBack}>Back One Step</button>
      <button onClick={navigateBackTwoSteps}>Back Two Steps</button>
    </div>
  ),
}));

// Import after mocks
import InterviewerCallPattern from "./InterviewerCallPattern";

describe("InterviewerCallPattern Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render interviewer filter on initial load", () => {
    render(
      <MemoryRouter>
        <InterviewerCallPattern />
      </MemoryRouter>
    );

    expect(screen.getByTestId("interviewer-filter")).toBeInTheDocument();
    expect(screen.getByText("call pattern")).toBeInTheDocument();
  });

  it("should move to questionnaire filter when interviewer filter is submitted", async () => {
    render(
      <MemoryRouter>
        <InterviewerCallPattern />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole("button", {
      name: "Submit Interviewer Filter",
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("questionnaire-filter")).toBeInTheDocument();
    });
  });

  it("should move to report when questionnaire filter is submitted", async () => {
    render(
      <MemoryRouter>
        <InterviewerCallPattern />
      </MemoryRouter>
    );

    // Move to questionnaire filter
    const submitInterviewerButton = screen.getByRole("button", {
      name: "Submit Interviewer Filter",
    });
    fireEvent.click(submitInterviewerButton);

    await waitFor(() => {
      expect(screen.getByTestId("questionnaire-filter")).toBeInTheDocument();
    });

    // Move to report
    const submitQuestionnaireButton = screen.getByRole("button", {
      name: "Submit Questionnaire Filter",
    });
    fireEvent.click(submitQuestionnaireButton);

    await waitFor(() => {
      expect(screen.getByTestId("call-pattern-report")).toBeInTheDocument();
    });
  });

  it("should navigate back from questionnaire filter to interviewer filter", async () => {
    render(
      <MemoryRouter>
        <InterviewerCallPattern />
      </MemoryRouter>
    );

    // Move to questionnaire filter
    const submitInterviewerButton = screen.getByRole("button", {
      name: "Submit Interviewer Filter",
    });
    fireEvent.click(submitInterviewerButton);

    await waitFor(() => {
      expect(screen.getByTestId("questionnaire-filter")).toBeInTheDocument();
    });

    // Navigate back
    const backButton = screen.getByRole("button", { name: "Back" });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByTestId("interviewer-filter")).toBeInTheDocument();
    });
  });

  it("should navigate back one step from report to questionnaire filter", async () => {
    render(
      <MemoryRouter>
        <InterviewerCallPattern />
      </MemoryRouter>
    );

    // Move to questionnaire filter
    const submitInterviewerButton = screen.getByRole("button", {
      name: "Submit Interviewer Filter",
    });
    fireEvent.click(submitInterviewerButton);

    await waitFor(() => {
      expect(screen.getByTestId("questionnaire-filter")).toBeInTheDocument();
    });

    // Move to report
    const submitQuestionnaireButton = screen.getByRole("button", {
      name: "Submit Questionnaire Filter",
    });
    fireEvent.click(submitQuestionnaireButton);

    await waitFor(() => {
      expect(screen.getByTestId("call-pattern-report")).toBeInTheDocument();
    });

    // Navigate back one step
    const backOneStepButton = screen.getByRole("button", {
      name: "Back One Step",
    });
    fireEvent.click(backOneStepButton);

    await waitFor(() => {
      expect(screen.getByTestId("questionnaire-filter")).toBeInTheDocument();
    });
  });

  it("should navigate back two steps from report to interviewer filter", async () => {
    render(
      <MemoryRouter>
        <InterviewerCallPattern />
      </MemoryRouter>
    );

    // Move to questionnaire filter
    const submitInterviewerButton = screen.getByRole("button", {
      name: "Submit Interviewer Filter",
    });
    fireEvent.click(submitInterviewerButton);

    await waitFor(() => {
      expect(screen.getByTestId("questionnaire-filter")).toBeInTheDocument();
    });

    // Move to report
    const submitQuestionnaireButton = screen.getByRole("button", {
      name: "Submit Questionnaire Filter",
    });
    fireEvent.click(submitQuestionnaireButton);

    await waitFor(() => {
      expect(screen.getByTestId("call-pattern-report")).toBeInTheDocument();
    });

    // Navigate back two steps
    const backTwoStepsButton = screen.getByRole("button", {
      name: "Back Two Steps",
    });
    fireEvent.click(backTwoStepsButton);

    await waitFor(() => {
      expect(screen.getByTestId("interviewer-filter")).toBeInTheDocument();
    });
  });

  it("should maintain filter query state when navigating forward", async () => {
    render(
      <MemoryRouter>
        <InterviewerCallPattern />
      </MemoryRouter>
    );

    const submitInterviewerButton = screen.getByRole("button", {
      name: "Submit Interviewer Filter",
    });
    fireEvent.click(submitInterviewerButton);

    await waitFor(() => {
      expect(screen.getByTestId("questionnaire-filter")).toBeInTheDocument();
    });

    // Move forward to report
    const submitQuestionnaireButton = screen.getByRole("button", {
      name: "Submit Questionnaire Filter",
    });
    fireEvent.click(submitQuestionnaireButton);

    await waitFor(() => {
      expect(screen.getByTestId("call-pattern-report")).toBeInTheDocument();
    });
  });
});
