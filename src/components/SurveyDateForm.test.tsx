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
import MockDate from "mockdate";
import SurveyDateForm from "./SurveyDateForm";
import flushPromises from "../tests/utilities";

const christmasEve97 = "1997-12-24";

describe("form - survey, date", () => {
    beforeEach(() => {
        MockDate.set(new Date(christmasEve97));
    });

    afterEach(() => {
        MockDate.reset();
    });

    it("matches snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <MemoryRouter history={history}>
                <SurveyDateForm onSubmitFunction={() => true} />
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
                    <SurveyDateForm onSubmitFunction={() => true} />
                </MemoryRouter>,
            );
        });
        expect(screen.queryByText("Select survey")).toBeVisible();
        expect(screen.queryByText("Show all surveys")).toBeVisible();
        expect(screen.queryByText("LMS")).toBeVisible();
        expect(screen.queryByText("Labour Market Survey")).toBeVisible();
        expect(screen.queryByText("OPN")).toBeVisible();
        expect(screen.queryByText("Opinions and Lifestyle Survey")).toBeVisible();
        expect(screen.queryByText("Date")).toBeVisible();
        expect(screen.queryByText("Run")).toBeVisible();
    });
});
