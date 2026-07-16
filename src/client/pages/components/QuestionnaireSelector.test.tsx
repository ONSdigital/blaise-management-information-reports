import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/dom";
import { render, type RenderResult, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import React from "react";
import { act } from "react-dom/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import flushPromises from "../../test-utils/flushPromises";

import QuestionnaireSelector from "./QuestionnaireSelector";

const mockAdapter = new MockAdapter(axios);

const questionnairesReturned = ["LMS2101_AA1", "LMS2101_BB1", "LMS2101_CC1"];

describe("QuestionnaireSelector tests", () => {
  let setSelectedQuestionnaires: (questionnaires: string[]) => void;
  let submit: () => void;
  let view: RenderResult;

  function renderComponent() {
    return render(
      <QuestionnaireSelector
        questionnaires={questionnairesReturned}
        selectedQuestionnaires={["LMS2101_AA1"]}
        setSelectedQuestionnaires={setSelectedQuestionnaires}
        onSubmit={submit}
      />,
    );
  }

  beforeEach(async () => {
    setSelectedQuestionnaires = vi.fn();
    submit = vi.fn();
    await act(async () => {
      view = renderComponent();
    });
  });

  afterEach(() => {
    mockAdapter.reset();
  });

  it("matches snapshot", async () => {
    mockAdapter.onPost("/api/questionnaires").reply(200, questionnairesReturned);
    await screen.findByText("LMS2101_AA1");
    expect(view).toMatchSnapshot();
  });

  describe("it renders correctly", () => {
    it("displays a 'Select All' button", () => {
      expect(view.getByText("Select All")).toBeVisible();
    });

    it("displays all available questionnaires", () => {
      questionnairesReturned.forEach((questionnaire) => {
        expect(screen.getByText(questionnaire)).toBeVisible();
        expect(screen.getByRole("checkbox", { name: questionnaire })).toBeVisible();
      });
    });
  });

  describe("when a questionnaire is selected", () => {
    it("displays a tick in the checkbox", () => {
      const checkBox = screen.getByRole("checkbox", { name: "LMS2101_BB1", checked: false });

      fireEvent.click(checkBox);
      expect(screen.getByRole("checkbox", { name: "LMS2101_BB1", checked: true }));
    });

    it("returns the selected questionnaires when submitted", async () => {
      expect(screen.getByRole("checkbox", { name: "LMS2101_AA1" })).toBeChecked();
      const checkBox = screen.getByRole("checkbox", { name: "LMS2101_BB1", checked: false });

      fireEvent.click(checkBox);
      fireEvent.click(screen.getByRole("button", { name: "Run report" }));
      await waitFor(() => expect(submit).toHaveBeenCalled());
      expect(setSelectedQuestionnaires).toHaveBeenCalledWith(["LMS2101_AA1", "LMS2101_BB1"]);
    });
  });

  describe("when 'Select all' is selected", () => {
    it("selects all questionnaires", async () => {
      fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));
      questionnairesReturned.forEach((questionnaire) => {
        expect(view.getByRole("checkbox", { name: questionnaire, checked: true }));
      });
    });

    it("changes to unselect all", async () => {
      fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));

      await act(async () => {
        await flushPromises();
      });
      expect(view.getByText("Unselect All")).toBeVisible();
    });

    it("returns the selected questionnaires when submitted", async () => {
      fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));
      fireEvent.click(screen.getByRole("button", { name: "Run report" }));
      await waitFor(() => expect(submit).toHaveBeenCalled());
      expect(setSelectedQuestionnaires).toHaveBeenCalledWith([
        "LMS2101_AA1",
        "LMS2101_BB1",
        "LMS2101_CC1",
      ]);
    });
  });

  describe("when 'Unselect all' is selected", () => {
    it("unselects all questionnaires", async () => {
      fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));
      fireEvent.click(await screen.findByRole("button", { name: /Unselect All/ }));
      questionnairesReturned.forEach((questionnaire) => {
        expect(view.getByRole("checkbox", { name: questionnaire, checked: false }));
      });
    });

    it("changes to select all", async () => {
      fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));
      fireEvent.click(await screen.findByRole("button", { name: /Unselect All/ }));
      expect(view.getByText(/Select All/)).toBeVisible();
    });

    it("returns the selected questionnaires when submitted", async () => {
      fireEvent.click(await screen.findByRole("button", { name: /Select All/ }));
      fireEvent.click(await screen.findByRole("button", { name: /Unselect All/ }));
      fireEvent.click(screen.getByRole("button", { name: "Run report" }));
      await screen.findAllByText(/At least one questionnaire must be selected/);
      expect(submit).not.toHaveBeenCalled();
      expect(setSelectedQuestionnaires).not.toHaveBeenCalled();
    });
  });
});
