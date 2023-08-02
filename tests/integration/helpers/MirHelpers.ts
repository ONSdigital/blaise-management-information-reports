import { Page } from "@playwright/test";
import moment from "moment";
import { NewUser } from "blaise-api-node-client";

const REPORTS_URL = process.env.REPORTS_URL;

export async function loginMIR(page: Page, userCredentials: NewUser): Promise<void> {
    await page.goto(`${REPORTS_URL}/`);
    const loginHeader = page.locator("h1:has-text('Sign in')");
    if (await loginHeader.isVisible({ timeout: 100 })) {
        await page.locator("#username").type(`${userCredentials.name}`);
        await page.locator("#Password").type(`${userCredentials.password}`);
        await page.click("button[type=submit]");
    }
}

export function mirTomorrow(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return moment(tomorrow).format("DD/MM/YYYY");
}
