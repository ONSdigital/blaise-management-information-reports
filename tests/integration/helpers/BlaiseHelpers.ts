import BlaiseApiClient, {NewUser} from "blaise-api-node-client";
import {v4 as uuidv4} from "uuid";

export async function setupTestUser(blaiseApiClient: BlaiseApiClient): Promise<NewUser> {
    await connectToRestApi(blaiseApiClient);
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
        return await blaiseApiClient.createUser(user);
    } catch (error) {
        console.error(`Failed to create user: ${error}`);
        throw(error);
    }
}

export async function setupInstrument(blaiseApiClient: BlaiseApiClient, instrumentName: string): Promise<void> {
    const serverpark = "gusty";
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    await connectToRestApi(blaiseApiClient);
    await installInstrument(blaiseApiClient, serverpark, instrumentName);
    await addSurveyDays(blaiseApiClient, serverpark, today, tomorrow, instrumentName);
    await addDaybatch(blaiseApiClient, serverpark, today, instrumentName);
}

async function connectToRestApi(blaiseApiClient: BlaiseApiClient) {
    try {
        await blaiseApiClient.getDiagnostics();
    } catch (error) {
        console.error(`Failed to connect to the rest-api: ${error}`);
        throw(error);
    }
}

async function installInstrument(blaiseApiClient: BlaiseApiClient, serverpark: string, instrumentName: string) {
    try {
        await blaiseApiClient.installInstrument(serverpark, {instrumentFile: `${instrumentName}.bpkg`});
        for (let attempts = 0; attempts <= 12; attempts++) {
            const instrumentDetails = await blaiseApiClient.getInstrument(serverpark, `${instrumentName}`);
            if (instrumentDetails.status == "Active") {
                break;
            } else {
                console.log(`Instrument ${instrumentName} is not active, waiting to add cases`);
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
            await blaiseApiClient.addCase(serverpark, `${instrumentName}`, caseID.toString(), caseFields);
        }
    } catch (error) {
        console.error(`Failed to install instrument: ${error}`);
        throw(error);
    }
}

async function addSurveyDays(blaiseApiClient: BlaiseApiClient, serverpark: string, today: Date, tomorrow: Date, instrumentName: string) {
    try {
        await blaiseApiClient.addSurveyDays(serverpark, `${instrumentName}`, [today.toISOString(), tomorrow.toISOString()]);
    } catch (error) {
        console.error(`Failed to add survey days: ${error}`);
        throw(error);
    }
}

async function addDaybatch(blaiseApiClient: BlaiseApiClient, serverpark: string, today: Date, instrumentName: string) {
    try {
        await blaiseApiClient.addDaybatch(serverpark, `${instrumentName}`, {
            dayBatchDate: today.toISOString(),
            checkForTreatedCases: false
        });
    } catch (error) {
        console.error(`Failed to add daybatch: ${error}`);
        throw(error);
    }
}