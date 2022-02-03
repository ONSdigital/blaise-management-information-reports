import { newServer } from "./Server"; // Link to your server file
import supertest, { Response } from "supertest";
import { loadConfigFromEnv } from "./Config";
import BlaiseIapNodeProvider from "blaise-iap-node-provider";
import BlaiseApiClient from "blaise-api-node-client";

const config = loadConfigFromEnv();
const authProvider = new BlaiseIapNodeProvider(config.BertClientId);
const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);

const app = newServer(config, authProvider, blaiseApiClient);
const request = supertest(app);

describe("Test Heath Endpoint", () => {
    it("should return a 200 status and json message", async () => {
        const response: Response = await request.get("/mir-ui/version/health");
        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual({ healthy: true });
    });
});
