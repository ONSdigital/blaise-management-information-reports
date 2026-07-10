import { describe, expect, it } from "vitest";
import { loadConfigFromEnv } from "./Config.js";

describe("Config setup", () => {
    it("should return the correct environment variables", () => {
        process.env = Object.assign({
            PROJECT_ID: "mock-project-id",
            BERT_URL: "mock-bert-url",
            BERT_CLIENT_ID: "mock-bert-client-id",
            BLAISE_API_URL: "mock-blaise-api-url",
            ROLES: "foo,bar,fwibble",
        });

        const config = loadConfigFromEnv();

        expect(config.projectId).toBe("mock-project-id");
        expect(config.bertUrl).toBe("mock-bert-url");
        expect(config.bertClientId).toBe("mock-bert-client-id");
        expect(config.blaiseApiUrl).toBe("mock-blaise-api-url");
        expect(config.Roles).toEqual(["foo", "bar", "fwibble"]);
    });

    it("should return variables with default string if variables are not defined", () => {
        process.env = Object.assign({
            PROJECT_ID: undefined,
            BERT_URL: undefined,
            BERT_CLIENT_ID: undefined,
            BLAISE_API_URL: undefined,
            ROLES: undefined,
        });

        const config = loadConfigFromEnv();

        expect(config.projectId).toBe("ENV_VAR_NOT_SET");
        expect(config.bertUrl).toBe("ENV_VAR_NOT_SET");
        expect(config.bertClientId).toBe("ENV_VAR_NOT_SET");
        expect(config.blaiseApiUrl).toBe("ENV_VAR_NOT_SET");
        expect(config.Roles).toEqual(["DST", "BDSS", "TO Manager"]);
    });
});
