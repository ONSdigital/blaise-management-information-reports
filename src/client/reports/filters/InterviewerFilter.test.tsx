import "@testing-library/jest-dom";
import { createMemoryHistory } from "history";
import { render, RenderResult, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { screen } from "@testing-library/dom";
import React from "react";
import { act } from "react-dom/test-utils";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";
import InterviewerFilter, { InterviewerFilterQuery } from "./InterviewerFilter";
import flushPromises from "../../tests/utilities";

describe("the interviewer details page renders correctly", () => {
    let submitFunction: () => void;

    let view: RenderResult;

    beforeEach(() => {
        submitFunction = vi.fn();

        const history = createMemoryHistory();

        const initialQuery: InterviewerFilterQuery = {
            interviewer: "James",
            startDate: new Date("2021-01-01"),
            endDate: new Date("2021-01-05"),
            surveyTla: "LMS",
        };

        view = render(
            <MemoryRouter history={history}>
                <InterviewerFilter
                    title=""
                    query={initialQuery}
                    onSubmit={submitFunction}
                />
            </MemoryRouter>,
        );
    });

    it("matches snapshot", async () => {
        vi.useRealTimers();

        expect(await view).toMatchSnapshot();
    });

    it("renders correctly", async () => {
        expect(screen.getByText(/Run interviewer/i)).toBeVisible();
        expect(screen.getByText(/Data in this report was last updated:/i)).toBeVisible();

        expect(screen.getByText(/Select survey/i)).toBeVisible();
        expect(screen.getByText(/Show all surveys/i)).toBeVisible();
        expect(screen.getByText(/LMS/i)).toBeVisible();
        expect(screen.getByText(/OPN/i)).toBeVisible();

        expect(screen.getByText(/Interviewer ID/i)).toBeVisible();

        expect(screen.getByText(/Start date/i)).toBeVisible();
        expect(screen.getByText(/End date/i)).toBeVisible();
    });

    it("updates the values", async () => {
        // const interviewer = screen.getByRole("textbox", { name: "Interviewer ID" });
        // await userEvent.clear(interviewer);
        // await userEvent.type(interviewer, "rich");

        // const startDate = screen.getByLabelText("Start date");
        // await userEvent.clear(startDate);
        // await userEvent.type(startDate, "2022-10-10");

        // const endDate = screen.getByLabelText("End date");
        // await userEvent.clear(endDate);
        // await userEvent.type(endDate, "2022-10-11");

        // await act(async () => {
        //     await flushPromises();
        // });

        // //const survey = screen.getByRole("radio", { name: "LMS Labour Market Survey" });
        // const survey = screen.getByLabelText(/LMS Labour Market Survey/i);
        // await userEvent.click(survey);

        // await userEvent.click(screen.getByRole("button", { name: "Next" }));

        // await waitFor(() => {
        //     expect(submitFunction).toHaveBeenCalledWith({
        //         interviewer: "rich",
        //         startDate: new Date("2022-10-10"),
        //         endDate: new Date("2022-10-11"),
        //         surveyTla: "lms",
        //     });
        // });


        const user = userEvent.setup();

        const interviewer = screen.getByRole("textbox", {
            name: /Interviewer ID/i,
        });

        await user.clear(interviewer);
        await user.type(interviewer, "rich");

        const startDate = screen.getByLabelText(/Start date/i);
        await user.clear(startDate);
        await user.type(startDate, "2022-10-10");

        const endDate = screen.getByLabelText(/End date/i);
        await user.clear(endDate);
        await user.type(endDate, "2022-10-11");

        expect(screen.getByText("Labour Market Survey")).toBeInTheDocument();
        const survey = screen.getByLabelText(/LMS/i);
        await user.click(survey);

        const nextButton = screen.getByRole("button", {
            name: /Next/i,
        });

        await user.click(nextButton);

        await waitFor(() => {
            expect(submitFunction).toHaveBeenCalledWith({
                interviewer: "rich",
                startDate: new Date("2022-10-10"),
                endDate: new Date("2022-10-11"),
                surveyTla: "lms",
            });
        });
    });
});
