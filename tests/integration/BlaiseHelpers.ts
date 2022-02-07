import BlaiseApiClient from "blaise-api-node-client";
import {v4 as uuidv4} from "uuid";

export type UserCredentials = {
    user_name: string
    password: string
}

export async function setupTestUser(blaiseApiClient: BlaiseApiClient, rest_api_client_id: string | undefined): Promise<UserCredentials> {
    await connectToRestApi(blaiseApiClient, rest_api_client_id);
    console.debug("Attempting to create test user...");
    const password = uuidv4();
    const userName = `dst-test-user-${uuidv4()}`;
    const user = {
        password: password,
        name: userName,
        role: "DST",
        serverParks: [
            "gusty"
        ],
        defaultServerPark: "gusty"
    };

    try {
        await blaiseApiClient.createUser(user);
    } catch (error) {
        console.error(`Failed to create user: ${error}`);
        throw(error);
    }
    console.debug(`User: ${userName}`);
    return {
        user_name: userName,
        password: password
    };
}

export async function setupInstrument(blaiseApiClient: BlaiseApiClient, rest_api_client_id: string | undefined, instrument_name: string | undefined) {
    const serverpark = "gusty";
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    await connectToRestApi(blaiseApiClient, rest_api_client_id);
    await installInstrument(blaiseApiClient, serverpark, instrument_name);
    await addSurveyDays(blaiseApiClient, serverpark, today, tomorrow, instrument_name);
    await addDaybatch(blaiseApiClient, serverpark, today, instrument_name);
}

async function connectToRestApi(blaiseApiClient: BlaiseApiClient, rest_api_client_id: string | undefined) {
    try {
        console.debug("Attempting to connect to the Rest Api...");
        console.debug(`REST_API_CLIENT_ID: ${rest_api_client_id}`);
        await blaiseApiClient.getDiagnostics();
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            console.error("Failed to connect to the rest-api.  Please ensure iap tunnel to the rest-api is connected");
            throw(error);
        }
        console.error(`Failed to connect to the rest-api: ${error}`);
        throw(error);
    }
}

async function installInstrument(blaiseApiClient: BlaiseApiClient, serverpark: string, instrument_name: string | undefined) {
    try {
        console.debug("Attempting to install Instrument...");

        await blaiseApiClient.installInstrument(serverpark, {instrumentFile: `${instrument_name}.bpkg`});
        for (let attempts = 0; attempts <= 12; attempts++) {
            const instrumentDetails = await blaiseApiClient.getInstrument(serverpark, `${instrument_name}`);
            if (instrumentDetails.status == "Active") {
                break;
            } else {
                console.log(`Instrument ${instrument_name} is not active, waiting to add cases`);
                await new Promise(f => setTimeout(f, 10000));
            }
        }
        for (let caseID = 1; caseID <= 10; caseID++) {
            const caseFields = {
                "qdatabag.telno": "07000 000 000",
                "qdatabag.telno2": "07000 000 000",
                "qdatabag.samptitle": "title",
                "qdatabag.sampfname": "fname",
                "qdatabag.sampsname": "sname",
                "qdatabag.name": "name"
            };
            await blaiseApiClient.addCase(serverpark, `${instrument_name}`, caseID.toString(), caseFields);
        }
    } catch (error) {
        console.error(`Failed to install instrument: ${error}`);
        throw(error);
    }
}

async function addSurveyDays(blaiseApiClient: BlaiseApiClient, serverpark: string, today: Date, tomorrow: Date, instrument_name: string | undefined) {
    try {
        console.debug("Attempting to add Survey Days...");

        await blaiseApiClient.addSurveyDays(serverpark, `${instrument_name}`, [today.toISOString(), tomorrow.toISOString()]);
    } catch (error) {
        console.error(`Failed to add survey days: ${error}`);
        throw(error);
    }
}

async function addDaybatch(blaiseApiClient: BlaiseApiClient, serverpark: string, today: Date, instrument_name: string | undefined) {
    try {
        console.debug("Attempting to create Daybatch...");

        await blaiseApiClient.addDaybatch(serverpark, `${instrument_name}`, {
            dayBatchDate: today.toISOString(),
            checkForTreatedCases: false
        });
    } catch (error) {
        console.error(`Failed to add daybatch: ${error}`);
        throw(error);
    }
}
