// @flow
describe("index.js", () => {
    it("should export what we expect it to export", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).toContainAllKeys(["JSDOMFifteen"]);
    });

    it("should export JSDOMFifteen pieces", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const {JSDOMFifteen: result} = await importedModule;

        // Assert
        expect(result).toContainAllKeys([
            "Configuration",
            "Environment",
            "ResourceLoader",
            "FileResourceLoader",
        ]);
    });
});
