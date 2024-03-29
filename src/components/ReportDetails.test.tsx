import React from "react";
import "@testing-library/jest-dom";
import { createMemoryHistory } from "history";
import { render } from "@testing-library/react";
import { Router } from "react-router";
import { act } from "react-dom/test-utils";
import { screen } from "@testing-library/dom";
import ReportDetails from "./ReportDetails";
import flushPromises from "../tests/utilities";

describe("ReportDetails", () => {
    it("matches snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <ReportDetails link="" title="" description="" />
            </Router>,
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
                <Router history={history}>
                    <ReportDetails link="blah-link" title="blah-title" description="blah-description" />
                </Router>,
            );
        });
        expect(screen.queryByText("blah-title")).toBeVisible();
        expect(screen.queryByText("blah-description")).toBeVisible();
    });
});
