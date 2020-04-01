// @flow
describe("index.js", () => {
    it("should export what we expect it to export", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).toContainAllKeys(["JSDOMSixteen"]);
    });

    it("should export JSDOMSixteen pieces", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const {JSDOMSixteen: result} = await importedModule;

        // Assert
        expect(result).toContainAllKeys([
            "Configuration",
            "Environment",
            "ResourceLoader",
        ]);
    });
});
