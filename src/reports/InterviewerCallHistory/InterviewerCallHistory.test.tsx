/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";

//TODO:
// Write unit/Gherkin test for rendering screen when no instrument found - get user requirements from Beth

describe("placeholder test - to be replaced by a ", () => {
    it("render a warning when no instruments are found test", async () => {
        return true;
    });
});

// describe("interviewer call history report without data", () => {
//     afterEach(() => {
//         MockDate.reset();
//         mockAdapter.reset();
//     });
//
//     beforeEach(() => {
//         mockAdapter.onPost("/api/reports/interviewer-call-history").reply(200, []);
//         mockAdapter.onGet("/api/reports/call-history-status").reply(
//             200, {}
//         );
//         MockDate.set(new Date(threeDaysFromTheNewMillennium));
//     });
//
//     it("matches snapshot", async () => {
//         const history = createMemoryHistory();
//
//         const wrapper = render(
//             <Router history={history}>
//                 <InterviewerCallHistory />
//             </Router>
//         );
//
//         await act(async () => {
//             await flushPromises();
//         });
//
//         await waitFor(() => {
//             expect(wrapper).toMatchSnapshot();
//         });
//     });
//
//     it("renders correctly", async () => {
//         const history = createMemoryHistory();
//
//         await act(async () => {
//             render(
//                 <Router history={history}>
//                     <InterviewerCallHistory />
//                 </Router>
//             );
//         });
//
//         expect(screen.queryByText("Run interviewer call history report")).toBeVisible();
//         expect(screen.queryByText("Select survey")).toBeVisible();
//         expect(screen.queryByText("Interviewer ID")).toBeVisible();
//         expect(screen.queryByText("Start date")).toBeVisible();
//         expect(screen.queryByText("End date")).toBeVisible();
//
//         userEvent.click(screen.getByText("LMS"));
//
//         userEvent.type(screen.getByLabelText(/Interviewer ID/i), "ricer");
//
//         userEvent.click(screen.getByTestId(/submit-button/i));
//
//         await act(async () => {
//             await flushPromises();
//         });
//
//         await waitFor(() => {
//             expect(screen.queryByText("Export report as Comma-Separated Values (CSV) file")).not.toBeVisible();
//             expect(screen.queryByText("No data found for parameters given.")).toBeVisible();
//         });
//
//     });
//
//     afterAll(() => {
//         jest.clearAllMocks();
//         cleanup();
//     });
// });
