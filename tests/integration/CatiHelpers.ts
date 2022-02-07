import {Page} from "@playwright/test";

const CATI_URL = process.env.CATI_URL;
const INSTRUMENT_NAME = process.env.TEST_INSTRUMENT;


export async function setupAppointment(page: Page, userName: string, password: string) {
    await loginCATI(page, userName, password);
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
    await casePage.type(".StringTextBoxComponent", `${userName}`);
    await casePage.click(".ButtonComponent:has-text('Save and continue')");
    await casePage.click(".CategoryButtonComponent >> nth=0");
    await casePage.click(".ButtonComponent:has-text('Save and continue')");
    await casePage.check("input:left-of(.CategoryButtonComponent:has-text('No'))");
    await casePage.click(".ButtonComponent:has-text('Save and continue')");
}

export async function clearCATIData(page: Page, userName: string, password: string) {
    await loginCATI(page, userName, password);
    await page.click(".nav li:has-text('Surveys')");
    await filterCATIInstrument(page);
    await page.click(".glyphicon-save");
    await page.uncheck("#chkBackupAll");
    await page.uncheck("#BackupDaybatch");
    await page.uncheck("#BackupCaseInfo");
    await page.uncheck("#BackupDialHistory");
    await page.uncheck("#BackupEvents");
    await page.click("#chkClearAll");
    await page.click("input[type=submit]:has-text('Execute')", {timeout: 200});
}

async function loginCATI(page: Page, userName: string, password: string) {
    await page.goto(`${CATI_URL}/blaise`);
    const loginHeader = page.locator("h1:has-text('Login')");
    if (await loginHeader.isVisible({timeout: 100})) {
        await page.locator("#Username").type(`${userName}`);
        await page.locator("#Password").type(`${password}`);
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

function tomorrow10am(): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.setHours(10, 0, 0, 0);
}
