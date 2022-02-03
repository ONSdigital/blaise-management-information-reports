
import React from "react";
import { createMemoryHistory } from "history";
import { cleanup, render, waitFor } from "@testing-library/react";
import LoginForm from "./LoginForm";
import { Router } from "react-router";
import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import flushPromises from "../tests/utilities";
import jwt from "jsonwebtoken";
import { AuthManager } from "../client/token";

const mockAdapter = new MockAdapter(axios);

let loggedIn = false;

function setLoggedIn(isLoggedIn: boolean) {
  loggedIn = isLoggedIn;
}

describe("Login form", () => {
  const authManager = new AuthManager();

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
    setLoggedIn(false);
    mockAdapter.reset();
  });

  it("matches snapshot", async () => {
    const history = createMemoryHistory();
    const wrapper = render(
      <Router history={history}>
        <LoginForm authManager={authManager} setLoggedIn={setLoggedIn} />
      </Router>
    );

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it("renders correctly", async () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <LoginForm authManager={authManager} setLoggedIn={setLoggedIn} />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryAllByText("Sign in")).toHaveLength(2);
      expect(screen.queryByText("Username")).toBeVisible();
      expect(screen.queryByText("Password")).toBeVisible();
    });
  });

  describe("when the username or password is incorrect", () => {
    it("renders an error and does not set the token", async () => {
      mockAdapter.onPost("/api/login/users/password/validate").reply(200, false);

      const history = createMemoryHistory();
      render(
        <Router history={history}>
          <LoginForm authManager={authManager} setLoggedIn={setLoggedIn} />
        </Router>
      );

      userEvent.type(screen.getByLabelText("Username"), "test");
      userEvent.type(screen.getByLabelText("Password"), "test");

      userEvent.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(screen.queryByText("Incorrect username or password")).toBeVisible();
      });

      expect(loggedIn).toBeFalsy();
    });
  });


  describe("when the username and password are correct but the user does not have permission", () => {
    it("renders an error and does not set the token", async () => {
      mockAdapter.onPost("/api/login/users/password/validate").reply(200, true);
      mockAdapter.onGet("/api/login/users/test/authorised").reply(403, { "error": "Not authorised" });

      const history = createMemoryHistory();
      render(
        <Router history={history}>
          <LoginForm authManager={authManager} setLoggedIn={setLoggedIn} />
        </Router>
      );

      userEvent.type(screen.getByLabelText("Username"), "test");
      userEvent.type(screen.getByLabelText("Password"), "test");

      userEvent.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(screen.queryByText("You do not have the correct permissions")).toBeVisible();
      });

      expect(loggedIn).toBeFalsy();
    });
  });

  describe("when the username and password are correct and the user has permission", () => {
    it("sets the token", async () => {
      mockAdapter.onPost("/api/login/users/password/validate").reply(200, true);
      mockAdapter.onGet("/api/login/users/test/authorised").reply(200, { token: jwt.sign({ data: { "role": "test" } }, "test-secret") });

      const history = createMemoryHistory();
      render(
        <Router history={history}>
          <LoginForm authManager={authManager} setLoggedIn={setLoggedIn} />
        </Router>
      );

      userEvent.type(screen.getByLabelText("Username"), "test");
      userEvent.type(screen.getByLabelText("Password"), "test");

      userEvent.click(screen.getByTestId("submit-button"));

      await waitFor(async () => {
        await flushPromises();
      });

      expect(loggedIn).toBeTruthy();
    });
  });
});
