import {Page} from "@playwright/test";
import moment from "moment";

export async function loginMIR(page: Page, userName: string, password: string) {
    const loginHeader = page.locator("h1:has-text('Sign in')");
    if (await loginHeader.isVisible({timeout: 100})) {
        await page.locator("#username").type(`${userName}`);
        await page.locator("#Password").type(`${password}`);
        await page.click("button[type=submit]");
    }
}

export function reportTomorrow(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return moment(tomorrow).format("DD/MM/YYYY");
}

