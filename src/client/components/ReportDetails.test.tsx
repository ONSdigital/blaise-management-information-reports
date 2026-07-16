import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";
import { screen } from "@testing-library/dom";
import ReportDetails from "./ReportDetails";
import flushPromises from "../tests/utilities";

describe("ReportDetails", () => {
    it("matches snapshot", async () => {
        const wrapper = render(
            <MemoryRouter>
                <ReportDetails link="" title="" description="" />
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
                    <ReportDetails link="blah-link" title="blah-title" description="blah-description" />
                </MemoryRouter>,
            );
        });
        expect(screen.queryByText("blah-title")).toBeVisible();
        expect(screen.queryByText("blah-description")).toBeVisible();
    });
});
