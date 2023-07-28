import { Page } from "@playwright/test";
import { INewUser } from "blaise-api-node-client";

const CATI_URL = process.env.CATI_URL;

export async function setupAppointment(page: Page, questionnaireName: string, userCredentials: INewUser): Promise<void> {
    console.log(`Attempting to set up an appointment for questionnaire ${questionnaireName}`);

    await new Promise((f) => setTimeout(f, 20000));

    await loginCATI(page, userCredentials);
    await page.click(".nav li:has-text('Case Info')");
    await filterCATIQuestionnaire(page, questionnaireName);

    const [casePage] = await Promise.all([
        page.waitForEvent("popup"),
        await page.click(".glyphicon-calendar >> nth=0"),
    ]);
    await casePage.check("input:left-of(.CategoryButtonComponent:has-text('Appointment agreed'))");
    await casePage.click(".ButtonComponent:has-text('Save and continue')");
    await casePage.locator("table.e-schedule-table").locator("tbody")
        .locator(`//tr/td[@data-date=${catiTomorrow10am()}]`).click();
    await casePage.click("button:has-text('Confirm')");
    await casePage.click(".ButtonComponent:has-text('Save and continue')");
    await casePage.type(".StringTextBoxComponent", `${userCredentials}`);
    await casePage.click(".ButtonComponent:has-text('Save and continue')");
    await casePage.click(".CategoryButtonComponent >> nth=0");
    await casePage.click(".ButtonComponent:has-text('Save and continue')");
    await casePage.check("input:left-of(.CategoryButtonComponent:has-text('No'))");
    await casePage.click(".ButtonComponent:has-text('Save and continue')");

    console.log(`Set up an appointment for questionnaire ${questionnaireName}`);
}

export async function clearCATIData(page: Page, questionnaireName: string, userCredentials: INewUser): Promise<void> {
    try {
        console.log(`Attempting to clear down CATI data for questionnaire ${questionnaireName}`);

        await new Promise((f) => setTimeout(f, 20000));
        await loginCATI(page, userCredentials);
        await page.click(".nav li:has-text('Surveys')");
        await filterCATIQuestionnaire(page, questionnaireName);
        await page.click(".glyphicon-save");
        await page.uncheck("#chkBackupAll");
        await page.uncheck("#BackupDaybatch");
        await page.uncheck("#BackupCaseInfo");
        await page.uncheck("#BackupDialHistory");
        await page.uncheck("#BackupEvents");
        await page.click("#chkClearAll");
        await page.click("input[type=submit]:has-text('Execute')", { timeout: 20000 });

        console.log(`Cleared CATI data for ${questionnaireName}`);
    }
    catch (error) {
        console.log(`Error clearing down CATI data: ${error}`);
    }
}

async function loginCATI(page: Page, userCredentials: INewUser) {
    await page.goto(`${CATI_URL}/blaise`);
    const loginHeader = page.locator("h1:has-text('Login')");
    if (await loginHeader.isVisible({ timeout: 20000 })) {
        await page.locator("#Username").type(`${userCredentials.name}`);
        await page.locator("#Password").type(`${userCredentials.password}`);
        await page.click("button[type=submit]");
    }
}

async function filterCATIQuestionnaire(page: Page, questionnaireName: string) {
    await page.waitForSelector("#MVCGrid_Loading_CaseInfoGrid", { state: "hidden" });
    await page.click(".filter-state:has-text('Filters')");
    await page.check(`text=${questionnaireName}`);
    await page.click("button:has-text('Apply')");
    await page.waitForSelector("#MVCGrid_Loading_CaseInfoGrid", { state: "hidden" });
}

function catiTomorrow10am(): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.setHours(10, 0, 0, 0);
}
