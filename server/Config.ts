import crypto from "crypto";
import { AuthConfig } from "blaise-login-react-server";

export interface Config extends AuthConfig {
    ProjectID: string
    BertUrl: string
    BertClientId: string
    BlaiseApiUrl: string
}

export function loadConfigFromEnv(): Config {
    let { PROJECT_ID, BERT_URL, BERT_CLIENT_ID, BLAISE_API_URL, SESSION_TIMEOUT } = process.env;
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

    if (SESSION_TIMEOUT === undefined || SESSION_TIMEOUT === "_SESSION_TIMEOUT") {
        console.error("SESSION_TIMEOUT environment variable has not been set");
        SESSION_TIMEOUT = "12h";
    }

    return {
        ProjectID: PROJECT_ID,
        BertUrl: BERT_URL,
        BertClientId: BERT_CLIENT_ID,
        BlaiseApiUrl: BLAISE_API_URL,
        Roles: loadRoles(ROLES),
        SessionTimeout: SESSION_TIMEOUT,
        SessionSecret: sessionSecret(SESSION_SECRET)
    };
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
