export interface Config {
    ProjectID: string
    BertUrl: string
    BertClientId: string
    BlaiseApiUrl: string
    Roles: string[]
}

export function loadConfigFromEnv(): Config {
    let { PROJECT_ID, BERT_URL, BERT_CLIENT_ID, BLAISE_API_URL } = process.env;
    const { ROLES } = process.env;

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
        ProjectID: PROJECT_ID,
        BertUrl: BERT_URL,
        BertClientId: BERT_CLIENT_ID,
        BlaiseApiUrl: BLAISE_API_URL,
        Roles: loadRoles(ROLES)
    };
}

function loadRoles(roles: string | undefined): string[] {
    if (!roles || roles === "") {
        return ["DST", "BDSS", "TO Manager"];
    }
    return roles.split(",");
}
