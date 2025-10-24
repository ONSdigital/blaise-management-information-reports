import { PlaywrightTestConfig, devices } from "@playwright/test";
import { defineConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    forbidOnly: !!process.env.CI,
    retries: Number(process.env.RETRIES) || 0,
    use: {
        trace: process.env.TRACE ? "on" : "on-first-retry",
        locale: "en-GB",
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'],
            viewport: { width: 1920, height: 1080 },
            launchOptions: { args: ['--start-maximized'] } },
        },
    ],
    globalSetup: require.resolve('./tests/global-setup.ts'),
};
export default config;
