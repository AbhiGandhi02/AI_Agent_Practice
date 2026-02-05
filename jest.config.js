module.exports = {
    testEnvironment: "node",
    testMatch: ["**/tests/unit/**/*.test.js"],
    collectCoverageFrom: [
        "src/**/*.js",
        "!src/app.js"
    ],
    coverageDirectory: "coverage",
    verbose: true,
    testTimeout: 10000,

    // Setup files
    setupFilesAfterEnv: ["./tests/setup.js"],

    // Clear mocks between tests
    clearMocks: true
};
