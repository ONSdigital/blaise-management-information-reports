import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { getUser, validatePassword, validateToken, validateUserPermissions } from "./user";

const mock = new MockAdapter(axios);

describe("Get user", () => {
  it("returns the user details", async () => {
    mock.onGet("/api/login/users/bob").reply(200, { "role": "test" });

    expect(await getUser("bob")).toEqual({ "role": "test" });
  });
});

describe("Validate password", () => {
  it("returns the user details", async () => {
    mock.onPost("/api/login/users/password/validate").reply(200, true);

    expect(await validatePassword("bob", "bobs-password")).toBeTruthy();
  });
});

describe("Validate user permissions", () => {
  afterEach(() => {
    mock.reset();
  });

  it("returns the true and the users jwt", async () => {
    mock.onGet("/api/login/users/bob/authorised").reply(200, { token: "example-token" });

    const [validated, token] = await validateUserPermissions("bob");
    expect(validated).toBeTruthy();
    expect(token).toEqual("example-token");
  });


  it("returns false", async () => {
    mock.onGet("/api/login/users/bob/authorised").reply(403, { "error": "not authorised" });

    const [validated, token] = await validateUserPermissions("bob");
    expect(validated).toBeFalsy();
    expect(token).toBeNull();
  });
});

describe("Validate token", () => {
  afterEach(() => {
    mock.reset();
  });

  it("returns true", async () => {
    mock.onPost("/api/login/token/validate").reply(200);

    expect(await validateToken("example-token")).toBeTruthy();
  });


  it("returns false", async () => {
    mock.onPost("/api/login/token/validate").reply(403);

    expect(await validateToken("example-token")).toBeFalsy();
  });
});
