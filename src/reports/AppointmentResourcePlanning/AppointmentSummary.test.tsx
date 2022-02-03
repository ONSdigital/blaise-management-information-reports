/**
 * @jest-environment jsdom
 */

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMemoryHistory } from "history";
import { Router } from "react-router";
import AppointmentSummary from "./AppointmentSummary";

describe("Appointment Summary Section", () => {
    const languageSummary = [
        { language: "English", total: 12 },
        { language: "Welsh", total: 56 },
    ];

    it("displays appointment summary", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <AppointmentSummary data={languageSummary} failed={false} />
            </Router>
        );

        await waitFor(() => {
            const list = screen.queryAllByTestId(/summary-table-row/i);
            const listItemOne = list[0];
            const firstRowLanguage = listItemOne.firstChild;
            if (firstRowLanguage !== null) {
                expect(firstRowLanguage.textContent).toEqual("English");
            }
            const firstRowTotal = listItemOne.lastChild;
            if (firstRowTotal !== null) {
                expect(firstRowTotal.textContent).toEqual("12");
            }

            const listItemTwo = list[1];
            const secondRowLanguage = listItemTwo.firstChild;
            if (secondRowLanguage !== null) {
                expect(secondRowLanguage.textContent).toEqual("Welsh");
            }
            const secondRowTotal = listItemTwo.lastChild;
            if (secondRowTotal !== null) {
                expect(secondRowTotal.textContent).toEqual("56");
            }

            expect(screen.queryByText("English")).toBeVisible();
            expect(screen.queryByText("12")).toBeVisible();
            expect(screen.queryByText("Welsh")).toBeVisible();
            expect(screen.queryByText("56")).toBeVisible();
        });
    });

    it("displays error message on failure", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <AppointmentSummary data={[]} failed={true} />
            </Router>
        );

        await waitFor(() => {
            expect(screen.queryByText("Failed to get appointment language summary")).toBeVisible();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
