import { expect, Page, test } from "@playwright/test";
import BlaiseApiClient, {NewUser} from "blaise-api-node-client";
import { setupInstrument, setupTestUser } from "./helpers/BlaiseHelpers";
import { setupAppointment, clearCATIData } from "./helpers/CatiHelpers";
import { loginMIR, mirTomorrow } from "./helpers/MirHelpers";

const REST_API_URL = process.env.REST_API_URL || "http://localhost:8000";
const REST_API_CLIENT_ID = process.env.REST_API_CLIENT_ID || undefined;
const INSTRUMENT_NAME = process.env.TEST_INSTRUMENT;

if (!INSTRUMENT_NAME) {
    console.error("Instrument name is undefined");
    process.exit(1);
}

test.describe("Without data", () => {
    let userCredentials: NewUser;
    let blaiseApiClient: BlaiseApiClient;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.setTimeout(170000);
        console.log(`Running ${testInfo.title}`);
        blaiseApiClient = new BlaiseApiClient(REST_API_URL, { blaiseApiClientId: REST_API_CLIENT_ID });
        userCredentials = await setupTestUser(blaiseApiClient);
    });

    test.afterEach(async () => {
        await blaiseApiClient.deleteUser(userCredentials.name);
    });

    test("I can get to, and run an ARPR for a day with no data", async ({ page }) => {
        await loginMIR(page, userCredentials);
        await page.click("#appointment-resource-planning");

        await expect(page.locator("h1")).toHaveText("Run appointment resource planning report");
        await expect(page.locator(".panel--info >> nth=0")).toContainText("Run a Daybatch first to obtain the most accurate results.");

        await page.locator("#date").type("30-06-1990");
        await page.click("button[type=submit]");

        await expect(page.locator(".panel--info >> nth=1")).toHaveText("No data found for parameters given.");
    });
});

test.describe("With data", () => {
    let userCredentials: NewUser;
    let blaiseApiClient: BlaiseApiClient;

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.setTimeout(170000);
        console.log(`Running ${testInfo.title}`);
        blaiseApiClient = new BlaiseApiClient(REST_API_URL, { blaiseApiClientId: REST_API_CLIENT_ID });

        userCredentials = await setupTestUser(blaiseApiClient);
        await setupInstrument(blaiseApiClient, INSTRUMENT_NAME);
        await setupAppointment(page, INSTRUMENT_NAME, userCredentials);
    });

    test.afterEach(async ({ page }) => {
        const serverpark = "gusty";
        const blaiseApiClient = new BlaiseApiClient(REST_API_URL, { blaiseApiClientId: REST_API_CLIENT_ID });

        await clearCATIData(page, INSTRUMENT_NAME, userCredentials);
        await blaiseApiClient.deleteInstrument(serverpark, `${INSTRUMENT_NAME}`);
        await blaiseApiClient.deleteUser(userCredentials.name);
    });

    test("I can get to, and run an ARPR for a day with data", async ({ page }) => {
        await new Promise(f => setTimeout(f, 10000));
        await loginMIR(page, userCredentials);

        await page.click("#appointment-resource-planning");

        await expect(page.locator("h1")).toHaveText("Run appointment resource planning report");
        await expect(page.locator(".panel--info >> nth=0")).toContainText("Run a Daybatch first to obtain the most accurate results.");

        await page.locator("#date").type(`${mirTomorrow()}`);
        await page.click("button[type=submit]");

        // Summary items
        await expect(page.locator(".summary__item-title")).toHaveText("English");
        await expect(page.locator(".summary__values")).toHaveText("1");

        // Report items
        await expect(page.locator(".table__row:has-text('DST2111Z') >> nth=0 >> td >> nth=1")).toHaveText("10:00");
        await expect(page.locator(".table__row:has-text('DST2111Z') >> nth=0 >> td >> nth=2")).toHaveText("English");
        await expect(page.locator(".table__row:has-text('DST2111Z') >> nth=0 >> td >> nth=3")).toHaveText("1");
    });
});
