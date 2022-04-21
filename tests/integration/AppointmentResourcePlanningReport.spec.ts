import { expect, test } from "@playwright/test";
import BlaiseApiClient, {NewUser} from "blaise-api-node-client";
import {deleteTestUser, setupInstrument, setupTestUser, unInstallInstrument,} from "./helpers/BlaiseHelpers";
import { setupAppointment, clearCATIData } from "./helpers/CatiHelpers";
import { loginMIR, mirTomorrow } from "./helpers/MirHelpers";

const restApiUrl = process.env.REST_API_URL || "http://localhost:8000";
const restApiClientId = process.env.REST_API_CLIENT_ID || undefined;
const instrumentName = process.env.TEST_INSTRUMENT;
const serverPark = process.env.SERVER_PARK;
const blaiseApiClient = new BlaiseApiClient(restApiUrl, { blaiseApiClientId: restApiClientId });

let userCredentials: NewUser;

if (!instrumentName) {
    console.error("Instrument name is undefined");
    process.exit(1);
}

if (!serverPark) {
    console.error("Server park is undefined");
    process.exit(1);
}

test.describe("Without data", () => {
    test.beforeEach(async ({ page }, testInfo) => {
        console.log(`Started running before each hook for test ${testInfo.title}`);

        testInfo.setTimeout(300000);
        userCredentials = await setupTestUser(blaiseApiClient, serverPark);

        console.log(`Finished running before each hook for test ${testInfo.title}`);
    });

    test.afterEach(async ({ page }, testInfo) => {
        console.log(`Started running after each hook for test ${testInfo.title}`);

        await deleteTestUser(blaiseApiClient, serverPark, userCredentials.name);

        console.log(`Finished running after each hook for test ${testInfo.title}`);
    });

    test("I can get to, and run an ARPR for a day with no data", async ({ page }, testInfo) => {
        try {
            console.log(`Started running ${testInfo.title}`);

            await loginMIR(page, userCredentials);
            await page.click("#appointment-resource-planning");

            await expect(page.locator("h1")).toHaveText("Run appointment resource planning report");
            await expect(page.locator(".panel--info >> nth=0")).toContainText("Run a Daybatch first to obtain the most accurate results.");
    
            await page.locator("#Date").type("30-06-1990");
            await page.click("button[type=submit]");
    
            await expect(page.locator(".panel--info >> nth=1")).toHaveText("No data found for parameters given.");

            console.log(`Finished running ${testInfo.title}`);
        }
        catch (error) {
            console.log(`Test ${testInfo.title} failed: ${error}`);
        }
    });
});

test.describe("With data", () => {
    test.beforeEach(async ({ page }, testInfo) => {
        console.log(`Started running before each hook for test ${testInfo.title}`);

        testInfo.setTimeout(300000);

        userCredentials = await setupTestUser(blaiseApiClient, serverPark);
        await setupInstrument(blaiseApiClient, instrumentName, serverPark);
        await setupAppointment(page, instrumentName, userCredentials);

        console.log(`Finished running before each hook for test ${testInfo.title}`);
    });

    test.afterEach(async ({ page }, testInfo) => {
        console.log(`Started running after each hook for test ${testInfo.title}`);

        await deleteTestUser(blaiseApiClient, serverPark, userCredentials.name);
        await clearCATIData(page, instrumentName, userCredentials);
        await unInstallInstrument(blaiseApiClient, serverPark, instrumentName);

        console.log(`Finished running after each hook for test ${testInfo.title}`);
    });

    test("I can get to, and run an ARPR for a day with data", async ({ page }, testInfo) => {
        try {
            console.log(`Started running ${testInfo.title}`);

            await loginMIR(page, userCredentials);

            await page.click("#appointment-resource-planning");

            await expect(page.locator("h1")).toHaveText("Run appointment resource planning report");
            await expect(page.locator(".panel--info >> nth=0")).toContainText("Run a Daybatch first to obtain the most accurate results.");

            await page.locator("#Date").type(`${mirTomorrow()}`);
            await page.click("button[type=submit]");

            // Report items
            await expect(page.locator(".table__row:has-text('DST2111Z') >> nth=0 >> td >> nth=1")).toHaveText("10:00");
            await expect(page.locator(".table__row:has-text('DST2111Z') >> nth=0 >> td >> nth=2")).toHaveText("English");
            await expect(page.locator(".table__row:has-text('DST2111Z') >> nth=0 >> td >> nth=3")).toHaveText("1");

            console.log(`Finished running ${testInfo.title}`);
        }
        catch (error) {
            console.log(`Test ${testInfo.title} failed: ${error}`);
        }
    });
});




