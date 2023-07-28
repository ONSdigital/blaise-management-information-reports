import BlaiseApiClient, { INewUser } from "blaise-api-node-client";
import { v4 as uuidv4 } from "uuid";

export async function setupTestUser(blaiseApiClient: BlaiseApiClient, serverPark: string): Promise<INewUser> {
    await connectToRestApi(blaiseApiClient);
    const password = uuidv4();
    const userName = `dst-test-user-${uuidv4()}`;
    const user = {
        password: password,
        name: userName,
        role: "DST",
        serverParks: [
            serverPark,
        ],
        defaultServerPark: serverPark,
    };

    try {
        console.log(`Attempting to create a test user ${user.name} on server park ${serverPark}`);

        const newUser = await blaiseApiClient.createUser(user);

        console.log(`Created test user ${user.name}`);

        return newUser;
    } catch (error) {
        console.error(`Failed to create user: ${error}`);
        throw (error);
    }
}

export async function deleteTestUser(blaiseApiClient: BlaiseApiClient, serverPark: string, userName: string): Promise<void> {
    try {
        console.log(`Attempting to delete test user ${userName}`);

        await blaiseApiClient.deleteUser(userName);

        console.log(`Deleted test user ${userName}`);
    }
    catch (error) {
        console.log(`There was an error deleting test user ${userName}: ${error}`);
    }
}

export async function setupQuestionnaire(blaiseApiClient: BlaiseApiClient, questionnaireName: string, serverPark: string): Promise<void> {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    console.log(`Attempting to install and configure questionnaire ${questionnaireName} on server park ${serverPark}`);

    await connectToRestApi(blaiseApiClient);
    await installQuestionnaire(blaiseApiClient, serverPark, questionnaireName);
    await addSurveyDays(blaiseApiClient, serverPark, today, tomorrow, questionnaireName);
    await addDaybatch(blaiseApiClient, serverPark, today, questionnaireName);

    console.log(`Installed and configured questionnaire ${questionnaireName} on server park ${serverPark}`);
}

async function connectToRestApi(blaiseApiClient: BlaiseApiClient) {
    try {
        await blaiseApiClient.getDiagnostics();
    } catch (error) {
        console.error(`Failed to connect to the rest-api: ${error}`);
        throw (error);
    }
}

async function installQuestionnaire(blaiseApiClient: BlaiseApiClient, serverPark: string, questionnaireName: string) {
    try {
        const installQuestionnaireObject = {
            questionnaireFile: `${questionnaireName}.bpkg`,
        };

        await blaiseApiClient.installQuestionnaire(serverPark, installQuestionnaireObject);
        for (let attempts = 0; attempts <= 12; attempts++) {
            const questionnaireDetails = await blaiseApiClient.getQuestionnaire(serverPark, `${questionnaireName}`);
            if (questionnaireDetails.status == "Active") {
                break;
            } else {
                console.log(`Questionnaire ${questionnaireName} is not active, waiting to add cases`);
                await new Promise((f) => setTimeout(f, 20000));
            }
        }
        for (let caseID = 1; caseID <= 10; caseID++) {
            const caseFields = {
                "qdatabag.telno": "07000 000 000",
                "qdatabag.telno2": "07000 000 000",
                "qdatabag.samptitle": "title",
                "qdatabag.sampfname": "fname",
                "qdatabag.sampsname": "sname",
                "qdatabag.name": "name",
            };
            await blaiseApiClient.addCase(serverPark, `${questionnaireName}`, caseID.toString(), caseFields);
        }
    } catch (error) {
        console.error(`Failed to install questionnaire: ${error}`);
        throw (error);
    }
}

export async function unInstallQuestionnaire(blaiseApiClient: BlaiseApiClient, serverPark: string, questionnaireName: string): Promise<void> {
    try {
        console.log(`Uninstalling test questionnaire ${questionnaireName}`);
        await blaiseApiClient.deleteQuestionnaire(serverPark, `${questionnaireName}`);
        console.log(`Uninstalled test questionnaire ${questionnaireName}`);
    }
    catch (error) {
        console.error(`Failed to uninstall questionnaire: ${error}`);
    }
}

async function addSurveyDays(blaiseApiClient: BlaiseApiClient, serverPark: string, today: Date, tomorrow: Date, questionnaireName: string) {
    try {
        await blaiseApiClient.addSurveyDays(serverPark, `${questionnaireName}`, [today.toISOString(), tomorrow.toISOString()]);
    } catch (error) {
        console.error(`Failed to add survey days: ${error}`);
        throw (error);
    }
}

async function addDaybatch(blaiseApiClient: BlaiseApiClient, serverPark: string, today: Date, questionnaireName: string) {
    try {
        await blaiseApiClient.addDaybatch(serverPark, `${questionnaireName}`, {
            dayBatchDate: today.toISOString(),
            checkForTreatedCases: false,
        });
    } catch (error) {
        console.error(`Failed to add daybatch: ${error}`);
        throw (error);
    }
}
