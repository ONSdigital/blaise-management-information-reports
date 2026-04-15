import React, { ReactNode } from "react";
import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { DataRenderer, LoadData } from "./LoadData";

describe("LoadData", () => {
    const display: DataRenderer<ReactNode> = (data) => <h3>{ data }</h3>;

    describe("initial state", () => {
        it("displays the loading spinner", () => {
            render(
                <LoadData
                    dataPromise={new Promise(() => {
                    }) as Promise<ReactNode>}
                >{ display }</LoadData>,
            );

            expect(screen.getByText("Loading")).toBeInTheDocument();
        });
    });

    describe("loaded state", () => {
        it("displays the loaded data", async () => {
            render(
                <LoadData
                    dataPromise={Promise.resolve("Hello world!")}
                >{ display }</LoadData>,
            );
            expect(await screen.findByRole("heading", { name: "Hello world!" })).toBeVisible();
        });

        it("does not display the loading spinner", async () => {
            render(
                <LoadData
                    dataPromise={Promise.resolve("Hello world!")}
                >{ display }</LoadData>,
            );
            await screen.findByRole("heading", { name: "Hello world!" });
            expect(screen.queryByText("Loading")).not.toBeInTheDocument();
        });
    });

    describe("errored state", () => {
        it("does not display the loading spinner", async () => {
            render(
                <LoadData
                    dataPromise={Promise.reject(new Error("There was an error"))}
                >{ display }</LoadData>,
            );
            expect(await screen.findByText("Error: There was an error")).toBeVisible();
        });

        it("displays the errorMessage if provided", async () => {
            render(
                <LoadData
                    dataPromise={Promise.reject(new Error("There was an error"))}
                    errorMessage="Custom error message"
                >{ display }</LoadData>,
            );
            expect(await screen.findByText("Custom error message")).toBeVisible();
        });

        it("displays formatted errorMessage if provided", async () => {
            render(
                <LoadData
                    dataPromise={Promise.reject(new Error("There was an error"))}
                    errorMessage={(error) => `ERROR: ${error}`}
                >{ display }</LoadData>,
            );
            expect(await screen.findByText("ERROR: Error: There was an error")).toBeVisible();
        });

        it("displays a dynamic JSX errorMessage if provided", async () => {
            render(
                <LoadData
                    dataPromise={Promise.reject(new Error("There was an error"))}
                    errorMessage={(error) => <strong>HTML ERROR: {error.toString()} </strong>}
                >{ display }</LoadData>,
            );
            expect(await screen.findByText("HTML ERROR: Error: There was an error")).toBeVisible();
        });

        it("displays turns off the error message if given false", async () => {
            render(
                <LoadData
                    dataPromise={Promise.reject(new Error("There was an error"))}
                    errorMessage={false}
                >{ display }</LoadData>,
            );
            await waitFor(() => { expect(screen.queryByText("Loading")).not.toBeInTheDocument(); });
            expect(screen.queryByText(/There was an error/)).not.toBeInTheDocument();
        });

        it("does not display the loading spinner", async () => {
            render(
                <LoadData
                    dataPromise={Promise.reject(new Error("There was an error"))}
                >{ display }</LoadData>,
            );
            await screen.findByText("Error: There was an error");
            expect(screen.queryByText("Loading")).not.toBeInTheDocument();
        });

        it("calls onError", async () => {
            const onError = jest.fn();
            render(
                <LoadData
                    dataPromise={Promise.reject(new Error("There was an error"))}
                    onError={onError}
                >{ display }</LoadData>,
            );
            await screen.findByText("Error: There was an error");
            expect(onError).toHaveBeenCalledWith(new Error("There was an error"));
        });
    });

    describe("dataPromise props changing", () => {
        let rerender: (ui: React.ReactElement) => void;

        beforeEach(async () => {
            const view = render(
                <LoadData
                    dataPromise={Promise.resolve("Old content")}
                >{ display }</LoadData>,
            );
            rerender = view.rerender;
            expect(await screen.findByRole("heading", { name: "Old content" })).toBeVisible();
            expect(screen.queryByText("Loading")).not.toBeInTheDocument();
        });

        it("displays the loading spinner when the dataPromise prop changes", async () => {
            rerender(
                <LoadData
                    dataPromise={new Promise(() => {
                    }) as Promise<ReactNode>}
                >{ display }</LoadData>,
            );

            expect(await screen.findByText("Loading")).toBeInTheDocument();
        });

        it("displays the new data when the dataPromise prop changes", async () => {
            rerender(
                <LoadData
                    dataPromise={Promise.resolve("New content")}
                >{ display }</LoadData>,
            );

            expect(await screen.findByRole("heading", { name: "New content" })).toBeInTheDocument();
        });
    });
});
