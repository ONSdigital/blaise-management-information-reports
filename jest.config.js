process.env = Object.assign(process.env, {
    PROJECT_ID: "mock-project-id",
    BERT_URL: "mock-bert-url",
    BERT_CLIENT_ID: "mock-bert-client-id"
});

module.exports = {
    testTimeout: 10000,
    moduleNameMapper: {
        "\\.(css|less|scss)$": "identity-obj-proxy",
        "\\.(jpg)$": "identity-obj-proxy"
    },
    coveragePathIgnorePatterns: [
        "<rootDir>/node_modules"
    ],
    testPathIgnorePatterns: [
        "<rootDir>/node_modules",
        "<rootDir>/tests/integration"
    ]
};
