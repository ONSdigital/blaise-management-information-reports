import { describe, expect, it } from "vitest";

import { assertResolvedRequiredEnv, loadConfigFromEnv } from "./Config.js";

describe("Config setup", () => {
  it("should return the correct environment variables", () => {
    process.env = Object.assign({
      PROJECT_ID: "mock-project-id",
      BERT_URL: "http://mock-bert-url",
      URL_DOMAIN: "surveys.test",
      BERT_CLIENT_ID: "mock-bert-client-id",
      BLAISE_API_URL: "http://mock-blaise-api-url",
      SERVER_PARK: "gusty",
    });

    const config = loadConfigFromEnv();

    expect(config.port).toBe(5000);
    expect(config.projectId).toBe("mock-project-id");
    expect(config.bertUrl).toBe("http://mock-bert-url");
    expect(config.bertClientId).toBe("mock-bert-client-id");
    expect(config.blaiseApiUrl).toBe("http://mock-blaise-api-url");
    expect(config.urlDomain).toBe("surveys.test");
    expect(config.serverPark).toBe("gusty");
    expect(config.Roles).toEqual(["DST", "BDSS", "TO Manager"]);
  });

  it("throws when required environment variables are missing", () => {
    expect(() =>
      assertResolvedRequiredEnv({
        PROJECT_ID: "mock-project-id",
        BERT_URL: "http://mock-bert-url",
        URL_DOMAIN: undefined,
        BERT_CLIENT_ID: "mock-bert-client-id",
        BLAISE_API_URL: "http://mock-blaise-api-url",
        SERVER_PARK: "gusty",
      }),
    ).toThrow("Missing required environment variables: URL_DOMAIN");
  });

  it("throws when URL_DOMAIN is malformed", () => {
    expect(() =>
      assertResolvedRequiredEnv({
        PROJECT_ID: "mock-project-id",
        BERT_URL: "http://mock-bert-url",
        URL_DOMAIN: "https://surveys.test/path",
        BERT_CLIENT_ID: "mock-bert-client-id",
        BLAISE_API_URL: "http://mock-blaise-api-url",
        SERVER_PARK: "gusty",
      }),
    ).toThrow("Malformed environment variables: URL_DOMAIN");
  });

  it("throws when PORT is invalid", () => {
    process.env = Object.assign({
      PROJECT_ID: "mock-project-id",
      BERT_URL: "http://mock-bert-url",
      URL_DOMAIN: "surveys.test",
      BERT_CLIENT_ID: "mock-bert-client-id",
      BLAISE_API_URL: "http://mock-blaise-api-url",
      SERVER_PARK: "gusty",
      PORT: "nope",
    });

    expect(() => loadConfigFromEnv()).toThrow("Invalid PORT value: nope");
  });
});
