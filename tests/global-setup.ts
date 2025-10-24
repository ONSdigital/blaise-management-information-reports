// file: tests/global-setup.ts

import { FullConfig } from '@playwright/test';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

async function getIapToken(audience: string): Promise<string> {
    const auth = new GoogleAuth();
    const idTokenClient = await auth.getIdTokenClient(audience);
    const headers = await idTokenClient.getRequestHeaders();
    return headers.Authorization;
}

// This function will be run by Playwright before any tests start.
async function globalSetup(config: FullConfig) {
    console.log('Running global setup to fetch IAP token...');
    try {
        const iapToken = await getIapToken("1034983553529-gapl7ndqce23gdtra82lc8di67eql2vl.apps.googleusercontent.com");
        
        // Save the token to a file. This is the standard way to pass data
        // from globalSetup to your tests.
        fs.writeFileSync('iapToken.txt', iapToken);

        console.log('Successfully fetched and saved IAP token.');
    } catch (error) {
        console.error('FATAL: Could not fetch IAP token in global setup.', error);
        process.exit(1); // Stop everything if auth fails
    }
}

export default globalSetup;