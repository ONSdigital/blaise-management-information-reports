import React from "react";
import "@testing-library/jest-dom";
import { createMemoryHistory } from "history";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { act } from "react-dom/test-utils";
import { screen } from "@testing-library/dom";
import ReportDetails from "./ReportDetails";
import flushPromises from "../tests/utilities";

describe("ReportDetails", () => {
    it("matches snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <MemoryRouter history={history}>
                <ReportDetails link="" title="" description="" />
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
                    <ReportDetails link="blah-link" title="blah-title" description="blah-description" />
                </MemoryRouter>,
            );
        });
        expect(screen.queryByText("blah-title")).toBeVisible();
        expect(screen.queryByText("blah-description")).toBeVisible();
    });
});
