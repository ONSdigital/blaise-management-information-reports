import dotenv from "dotenv";
import { IapProvider } from "blaise-iap-node-provider";
import { BlaiseApiClient } from "blaise-api-node-client";
import { Auth } from "blaise-login-react-server";
import { newServer } from "./Server.js";
import { loadConfigFromEnv } from "./Config.js";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const config = loadConfigFromEnv();

const authProvider = new IapProvider(config.bertClientId);
const blaiseApiClient = new BlaiseApiClient(config.blaiseApiUrl);
const auth = new Auth(config);

const app = newServer(config);

const port: string = process.env.PORT || "5000";

app.listen(port);

console.log(`App is listening on port ${port}`);
