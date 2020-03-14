// @flow
describe("index.js", () => {
    it("should export what we expect it to export", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).toContainAllKeys([
            "getGCloudSecrets",
            "getLogger",
            "makeCommonServiceRouter",
            "trace",
        ]);
    });

    it("should not export trace agent setup or things it uses", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).not.toContainAnyKeys([
            "getRuntimeMode",
            "startTraceAgent",
        ]);
    });
});
