// @flow
describe("index.js", () => {
    it("should export what we expect it to export", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).toContainAllKeys([
            "Errors",
            "getGCloudSecrets",
            "getLogLevel",
            "getRuntimeMode",
            "makeCommonServiceRouter",
        ]);
    });

    it("should not export trace agent setup", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).not.toContainAnyKeys(["startTraceAgent"]);
    });
});
