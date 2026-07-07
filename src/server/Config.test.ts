import { loadConfigFromEnv } from "./Config";

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

        expect(config.ProjectID).toBe("mock-project-id");
        expect(config.BertUrl).toBe("mock-bert-url");
        expect(config.BertClientId).toBe("mock-bert-client-id");
        expect(config.BlaiseApiUrl).toBe("mock-blaise-api-url");
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

        expect(config.ProjectID).toBe("ENV_VAR_NOT_SET");
        expect(config.BertUrl).toBe("ENV_VAR_NOT_SET");
        expect(config.BertClientId).toBe("ENV_VAR_NOT_SET");
        expect(config.BlaiseApiUrl).toBe("ENV_VAR_NOT_SET");
        expect(config.Roles).toEqual(["DST", "BDSS", "TO Manager"]);
    });
});
