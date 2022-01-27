import { test, expect, Page } from "@playwright/test";
import BlaiseApiClient from "blaise-api-node-client";
import moment from "moment";

const CATI_URL = process.env.CATI_URL;
const CATI_USERNAME = process.env.CATI_USERNAME;
const CATI_PASSWORD = process.env.CATI_PASSWORD || CATI_USERNAME;
const REPORTS_URL = process.env.REPORTS_URL;
const REST_API_URL = process.env.REST_API_URL || "http://localhost:8000";
const REST_API_CLIENT_ID = process.env.REST_API_CLIENT_ID || undefined;
const INSTRUMENT_NAME = process.env.TEST_INSTRUMENT;

test.describe("Without data", () => {
  test("I can get to, and run an ARPR for a day with no data", async ({ page }) => {
    await page.goto(`${REPORTS_URL}/`);
    await page.click("#appointment-resource-planning");
    await expect(page.locator("h1")).toHaveText("Run appointment resource planning report");
    await expect(page.locator(".panel--info >> nth=0")).toContainText("Run a Daybatch first to obtain the most accurate results.");
    await page.locator("#date").type("30-06-1990");
    await page.click("button[type=submit]");
    await expect(page.locator(".panel--info >> nth=1")).toHaveText("No data found for parameters given.");
  });
});

test.describe("With data", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(120000);
    console.log(`Running ${testInfo.title}`);
    await setupInstrument();
    // CATI seems to be a bit slow on the uptake sometimes...
    await new Promise(f => setTimeout(f, 10000));
    await setupAppointment(page);
  });

  test.afterEach(async ({ page }) => {
    const serverpark = "gusty";
    const blaiseApiClient = new BlaiseApiClient(REST_API_URL);
    await clearCATIData(page);
    blaiseApiClient.deleteInstrument(serverpark, `${INSTRUMENT_NAME}`);
  });

  test("I can get to, and run an ARPR for a day with data", async ({ page }) => {
    await page.goto(`${REPORTS_URL}/`);
    await new Promise(f => setTimeout(f, 10000));
    await page.click("#appointment-resource-planning");
    await expect(page.locator("h1")).toHaveText("Run appointment resource planning report");
    await expect(page.locator(".panel--info >> nth=0")).toContainText("Run a Daybatch first to obtain the most accurate results.");
    await page.locator("#date").type(`${reportTomorrow()}`);
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

async function setupInstrument() {
  const blaiseApiClient = new BlaiseApiClient(REST_API_URL, { blaiseApiClientId: REST_API_CLIENT_ID });
  const serverpark = "gusty";
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  await connectToRestApi(blaiseApiClient);
  await installInstrument(blaiseApiClient, serverpark);
  await addSurveyDays(blaiseApiClient, serverpark, today, tomorrow);
  await addDaybatch(blaiseApiClient, serverpark, today);
}

async function loginCATI(page: Page) {
  await page.goto(`${CATI_URL}/blaise`);
  const loginHeader = page.locator("h1:has-text('Login')");
  if (await loginHeader.isVisible({ timeout: 100 })) {
    await page.locator("#Username").type(`${CATI_USERNAME}`);
    await page.locator("#Password").type(`${CATI_PASSWORD}`);
    await page.click("button[type=submit]");
  }
}

async function filterCATIInstrument(page: Page) {
  await page.waitForSelector("#MVCGrid_Loading_CaseInfoGrid", { state: "hidden" });
  await page.click(".filter-state:has-text('Filters')");
  await page.check(`text=${INSTRUMENT_NAME}`);
  await page.click("button:has-text('Apply')");
  await page.waitForSelector("#MVCGrid_Loading_CaseInfoGrid", { state: "hidden" });
}

async function setupAppointment(page: Page) {
  await loginCATI(page);
  await page.click(".nav li:has-text('Case Info')");
  await filterCATIInstrument(page);

  const [casePage] = await Promise.all([
    page.waitForEvent("popup"),
    await page.click(".glyphicon-calendar >> nth=0"),
  ]);
  await casePage.check("input:left-of(.CategoryButtonComponent:has-text('Appointment agreed'))");
  await casePage.click(".ButtonComponent:has-text('Save and continue')");
  await casePage.locator("table.e-schedule-table").locator("tbody")
    .locator(`//tr/td[@data-date=${tomorrow10am()}]`).click();
  await casePage.click("button:has-text('Confirm')");
  await casePage.click(".ButtonComponent:has-text('Save and continue')");
  await casePage.type(".StringTextBoxComponent", `${CATI_USERNAME}`);
  await casePage.click(".ButtonComponent:has-text('Save and continue')");
  await casePage.click(".CategoryButtonComponent >> nth=0");
  await casePage.click(".ButtonComponent:has-text('Save and continue')");
  await casePage.check("input:left-of(.CategoryButtonComponent:has-text('No'))");
  await casePage.click(".ButtonComponent:has-text('Save and continue')");
}

async function clearCATIData(page: Page) {
  await loginCATI(page);
  await page.click(".nav li:has-text('Surveys')");
  await filterCATIInstrument(page);
  await page.click(".glyphicon-save");
  await page.uncheck("#chkBackupAll");
  await page.uncheck("#BackupDaybatch");
  await page.uncheck("#BackupCaseInfo");
  await page.uncheck("#BackupDialHistory");
  await page.uncheck("#BackupEvents");
  await page.click("#chkClearAll");
  await page.click("input[type=submit]:has-text('Execute')", { timeout: 5000 });
}

function tomorrow10am(): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.setHours(10, 0, 0, 0);
}

function reportTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return moment(tomorrow).format("DD/MM/YYYY");
}

async function connectToRestApi(blaiseApiClient: BlaiseApiClient) {
  try {
    await blaiseApiClient.getDiagnostics();
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error("Failed to connect to the rest-api.  Please ensure iap tunnel to the rest-api is connected");
      throw (error);
    }
    console.error(`Failed to connect to the rest-api: ${error}`);
    throw (error);
  }
}

async function installInstrument(blaiseApiClient: BlaiseApiClient, serverpark: string) {
  try {
    await blaiseApiClient.installInstrument(serverpark, { instrumentFile: `${INSTRUMENT_NAME}.bpkg` });
    for (let attempts = 0; attempts <= 12; attempts++) {
      const instrumentDetails = await blaiseApiClient.getInstrument(serverpark, `${INSTRUMENT_NAME}`);
      if (instrumentDetails.status == "Active") {
        break;
      } else {
        console.log(`Instrument ${INSTRUMENT_NAME} is not active, waiting to add cases`);
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
      await blaiseApiClient.addCase(serverpark, `${INSTRUMENT_NAME}`, caseID.toString(), caseFields);
    }
  } catch (error) {
    console.error(`Failed to install instrument: ${error}`);
    throw (error);
  }
}

async function addSurveyDays(blaiseApiClient: BlaiseApiClient, serverpark: string, today: Date, tomorrow: Date) {
  try {
    await blaiseApiClient.addSurveyDays(serverpark, `${INSTRUMENT_NAME}`, [today.toISOString(), tomorrow.toISOString()]);
  } catch (error) {
    console.error(`Failed to add survey days: ${error}`);
    throw (error);
  }

}

async function addDaybatch(blaiseApiClient: BlaiseApiClient, serverpark: string, today: Date) {
  try {
    await blaiseApiClient.addDaybatch(serverpark, `${INSTRUMENT_NAME}`, { dayBatchDate: today.toISOString(), checkForTreatedCases: false });
  } catch (error) {
    console.error(`Failed to add daybatch: ${error}`);
    throw (error);
  }
}
