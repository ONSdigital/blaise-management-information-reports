import crypto from "crypto";
import { type AuthConfig } from "blaise-login-react-server";

const DEFAULT_SESSION_TIMEOUT = "12h";
const ALLOWED_ROLES = ["DST", "BDSS", "TO Manager"];

export interface Config extends AuthConfig {
    projectId: string
    bertUrl: string
    bertClientId: string
    blaiseApiUrl: string,
    serverPark: string,
}

function loadRoles(roles: string | undefined): string[] {
    if (!roles || roles === "" || roles === "_ROLES") {
        return ["DST", "BDSS", "TO Manager"];
    }
    return roles.split(",");
}

function sessionSecret(secret: string | undefined): string {
    if (!secret || secret === "" || secret === "_SESSION_SECRET") {
        return crypto.randomBytes(20).toString("hex");
    }
    return secret;
}

export function loadConfigFromEnv(): Config {
    let {
        PROJECT_ID,
        BERT_URL,
        BERT_CLIENT_ID,
        BLAISE_API_URL,
    } = process.env;

    const { ROLES, SESSION_SECRET } = process.env;

    if (PROJECT_ID === undefined) {
        console.error("PROJECT_ID environment variable has not been set");
        PROJECT_ID = "ENV_VAR_NOT_SET";
    }

    if (BERT_URL === undefined) {
        console.error("BERT_URL environment variable has not been set");
        BERT_URL = "ENV_VAR_NOT_SET";
    }

    if (BERT_CLIENT_ID === undefined) {
        console.error("BERT_URL environment variable has not been set");
        BERT_CLIENT_ID = "ENV_VAR_NOT_SET";
    }

    if (BLAISE_API_URL === undefined) {
        console.error("BLAISE_API_URL environment variable has not been set");
        BLAISE_API_URL = "ENV_VAR_NOT_SET";
    }

    return {
        projectId: PROJECT_ID,
        bertUrl: BERT_URL,
        bertClientId: BERT_CLIENT_ID,
        blaiseApiUrl: BLAISE_API_URL,
        TokenIssuer: PROJECT_ID,
        Roles: loadRoles(ROLES),
        SessionTimeout: DEFAULT_SESSION_TIMEOUT,
        serverPark: "ENV_VAR_NOT_SET",
        SessionSecret: sessionSecret(SESSION_SECRET),
    };
}
