import { isProduction } from "./env";

const isProductionTestCases = [
    {
        hostname: "dev-training-reports.social-surveys.gcp.onsdigital.uk",
        expected: false,
    },
    {
        hostname: "localhost",
        expected: false,
    },
    {
        hostname: "reports.preprod-blaise.gcp.onsdigital.uk",
        expected: false,
    },
    {
        hostname: "reports.blaise.gcp.onsdigital.uk",
        expected: true,
    },
];

describe("isProduction", () => {
    it.each(isProductionTestCases)(
        "check whether a hostname is production",
        ({ hostname, expected }) => {
            expect(isProduction(hostname)).toEqual(expected as boolean);
        },
    );
});
