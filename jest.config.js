process.env = Object.assign(process.env, {
    PROJECT_ID: "mock-project-id",
    BERT_URL: "mock-bert-url",
    BERT_CLIENT_ID: "mock-bert-client-id"
});

module.exports = {
    testTimeout: 10000,
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    moduleNameMapper: {
        "^react-router-dom$": "<rootDir>/node_modules/react-router-dom/dist/index.js",
        "^react-router$": "<rootDir>/node_modules/react-router/dist/development/index.js",
        "^react-router/dom$": "<rootDir>/node_modules/react-router/dist/development/dom-export.js",
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
