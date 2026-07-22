import { type Page } from "@playwright/test";
import { type NewUser } from "blaise-api-node-client";
import moment from "moment";

import { normalizeUrl } from "./urlHelpers";

const REPORTS_URL = normalizeUrl("REPORTS_URL");

export async function loginToMir(page: Page, userCredentials: NewUser): Promise<void> {
  console.log(`Navigating to REPORTS_URL: ${REPORTS_URL}`);
  await page.goto(`${REPORTS_URL}`, { waitUntil: "domcontentloaded" });
  console.log(`Page loaded, title: ${await page.title()}`);
  console.log(`Page URL: ${page.url()}`);

  const loginHeader = page.locator("h1:has-text('Sign in')");
  const signInPageIsVisible = await loginHeader
    .waitFor({ state: "visible", timeout: 10000 })
    .then(() => {
      console.log("Sign in page is visible");

      return true;
    })
    .catch(async (error) => {
      console.warn(`Sign in page not visible within timeout: ${error.message}`);
      console.log(`Page content: ${await page.content()}`);

      return false;
    });

  if (signInPageIsVisible) {
    console.log(`Logging in with user: ${userCredentials.name}`);
    await page.getByLabel("Username").fill(`${userCredentials.name}`);
    await page.getByLabel("Password").fill(`${userCredentials.password}`);
    await page.getByRole("button", { name: "Sign in" }).click();
  } else {
    console.warn("Sign in page not found, skipping login");
  }

  console.log("Waiting for Appointment resource planning link");
  await page
    .getByRole("link", { name: "Appointment resource planning" })
    .waitFor({ state: "visible", timeout: 30000 });
}

export function createDateForTomorrow(): string {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  return moment(tomorrow).format("DD/MM/YYYY");
}
