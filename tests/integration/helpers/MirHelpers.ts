import { type Page } from "@playwright/test";
import { type NewUser } from "blaise-api-node-client";
import moment from "moment";

const REPORTS_URL = process.env.REPORTS_URL;

export async function loginToMir(page: Page, userCredentials: NewUser): Promise<void> {
    await page.goto(`${REPORTS_URL}`, { waitUntil: "domcontentloaded" });
    const loginHeader = page.locator("h1:has-text('Sign in')");
    const signInPageIsVisible = await loginHeader
        .waitFor({ state: "visible", timeout: 10000 })
        .then(() => true)
        .catch(() => false);

    if (signInPageIsVisible) {
        await page.locator("#username").fill(`${userCredentials.name}`);
        await page.locator("#Password").fill(`${userCredentials.password}`);
        await page.click("button[type=submit]");
    }

    await page.getByRole("link", { name: "Appointment resource planning" }).waitFor({ state: "visible", timeout: 30000 });
}

export function createDateForTomorrow(): string {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    return moment(tomorrow).format("DD/MM/YYYY");
}
