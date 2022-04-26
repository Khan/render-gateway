// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

// eslint-disable-next-line import/no-commonjs
module.exports = {
    // Automatically restore mocks between every test
    restoreMocks: true,

    // Automatically reset mocks between every test.
    resetMocks: true,

    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",

    // The test environment that will be used for testing
    testEnvironment: "node",

    // This sets the use of fake timers for functions such as "setTimeout"
    fakeTimers: {
        enableGlobally: true,
    },

    setupFilesAfterEnv: ["jest-extended/all"],
};
