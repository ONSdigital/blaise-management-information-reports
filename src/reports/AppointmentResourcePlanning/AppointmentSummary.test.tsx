import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import AppointmentSummary from "./AppointmentSummary";

describe("Appointment Summary Section", () => {
    const languageSummary = [
        { language: "English", total: 12 },
        { language: "Welsh", total: 56 },
    ];

    it("displays appointment summary", async () => {
       render(<AppointmentSummary data={languageSummary} failed={false} />, {wrapper: MemoryRouter});
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
        render(<AppointmentSummary data={[]} failed />, {wrapper: MemoryRouter});
        expect(await screen.queryByText("Failed to get appointment language summary")).toBeVisible();
    });
});
