import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import BlaiseApiClient, { NewUser } from "blaise-api-node-client";
import { deleteTestUser, setupQuestionnaire, setupTestUser, uninstallQuestionnaire } from "./helpers/BlaiseHelpers";
import { setupAppointment, clearCATIData } from "./helpers/CatiHelpers";
import { loginMIR, mirTomorrow } from "./helpers/MirHelpers";

if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: `${__dirname}/../../.env` });
}

const restApiUrl = process.env.REST_API_URL || "http://localhost:1337";
const restApiClientId = process.env.REST_API_CLIENT_ID || undefined;
const questionnaireName = process.env.TEST_QUESTIONNAIRE;
const serverPark = process.env.SERVER_PARK;
const blaiseApiClient = new BlaiseApiClient(restApiUrl, { blaiseApiClientId: restApiClientId });

let userCredentials: NewUser;

if (!questionnaireName) {
    console.error("Questionnaire name is undefined");
    process.exit(1);
}

if (!serverPark) {
    console.error("Server park is undefined");
    process.exit(1);
}

test.describe("Without data", () => {
    test.beforeEach(async ({ page }, testInfo) => {
        console.log(`Started running before each hook for test ${testInfo.title}`);
        testInfo.setTimeout(30000);
        userCredentials = await setupTestUser(blaiseApiClient, serverPark);
        console.log(`Finished running before each hook for test ${testInfo.title}`);
    });
    test.afterEach(async ({ page }, testInfo) => {
        console.log(`Started running after each hook for test ${testInfo.title}`);
        await deleteTestUser(blaiseApiClient, serverPark, userCredentials.name);
        console.log(`Finished running after each hook for test ${testInfo.title}`);
    });
    test("I can get to, and run an ARPR for a day with no data", async ({ page }, testInfo) => {
        console.log(`Started running ${testInfo.title}`);
        await loginMIR(page, userCredentials);
        await page.click("text=Appointment resource planning");
        await expect(page.locator("h1")).toHaveText("Run appointment resource planning report");
        await expect(page.locator(".ons-panel__body ").nth(0)).toContainText("Run a Daybatch first to obtain the most accurate results.");
        await expect(page.locator(".ons-panel__body ").nth(0)).toContainText("Appointments that have already been attempted will not be displayed.");
        await page.locator("#Date").type("30-06-1990");
        await page.click("button[type=submit]");
        await expect(page.locator(".ons-panel__body ").nth(1)).toContainText("No questionnaires found for given parameters.");
        console.log(`Finished running ${testInfo.title}`);
    });
});

test.describe("With data", () => {
    test.beforeEach(async ({ page }, testInfo) => {
        console.log(`Started running before each hook for test ${testInfo.title}`);
        testInfo.setTimeout(180000);
        userCredentials = await setupTestUser(blaiseApiClient, serverPark);
        await setupQuestionnaire(blaiseApiClient, questionnaireName, serverPark);
        await setupAppointment(page, questionnaireName, userCredentials);
        console.log(`Finished running before each hook for test ${testInfo.title}`);
    });
    test.afterEach(async ({ page }, testInfo) => {
        console.log(`Started running after each hook for test ${testInfo.title}`);
        await deleteTestUser(blaiseApiClient, serverPark, userCredentials.name);
        await clearCATIData(page, questionnaireName, userCredentials);
        await uninstallQuestionnaire(blaiseApiClient, serverPark, questionnaireName);
        console.log(`Finished running after each hook for test ${testInfo.title}`);
    });
    test("I can get to, and run an ARPR for a day with data", async ({ page }, testInfo) => {
        console.log(`Started running ${testInfo.title}`);
        await loginMIR(page, userCredentials);
        await page.click("text=Appointment resource planning");
        await expect(page.locator("h1")).toHaveText("Run appointment resource planning report");
        await expect(page.locator(".ons-panel__body ").nth(0)).toContainText("Run a Daybatch first to obtain the most accurate results.");
        await expect(page.locator(".ons-panel__body ").nth(0)).toContainText("Appointments that have already been attempted will not be displayed.");
        await page.locator("#Date").type(`${mirTomorrow()}`);
        await page.click("button[type=submit]");
        await page.click('button:has-text("Select All")');
        await page.click('button:has-text("Run report")');
        const row = await page.locator(`tr:has-text('${questionnaireName}')`);
        await expect(row.locator('td:nth-child(2)')).toHaveText("10:00");
        await expect(row.locator('td:nth-child(3)')).toHaveText("English");
        await expect(row.locator('td:nth-child(4)')).toHaveText("1");
        console.log(`Finished running ${testInfo.title}`);
    });
});

/*
test.describe("Placeholder test that always passes", () => {
    test("These integration tests need to be looked at again", () => {
        expect("True");
    });
});
*/
