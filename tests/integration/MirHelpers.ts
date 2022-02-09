import {Page} from "@playwright/test";
import moment from "moment";

export async function loginMIR(page: Page, reports_url: string | undefined, userName: string, password: string) {
    await page.goto(`${reports_url}/`);
    const loginHeader = page.locator("h1:has-text('Sign in')");
    if (await loginHeader.isVisible({timeout: 100})) {
        await page.locator("#username").type(`${userName}`);
        await page.locator("#Password").type(`${password}`);
        await page.click("button[type=submit]");
    }
}

// export async function logoutMIR(page: Page, reports_url: string | undefined) {
//     await page.goto(`${reports_url}/`);
//     const logoutButton = page.locator(".btn__inner:has-text('Sign out')");
//     if (await logoutButton.isVisible({timeout: 100})) {
//         await page.click(".btn__inner:has-text('Sign out')");
//     }
// }

export function mirTomorrow(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return moment(tomorrow).format("DD/MM/YYYY");
}
