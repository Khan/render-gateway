// @flow
describe("index.js", () => {
    it("should export what we expect it to export", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).toContainAllKeys(["Environments"]);
    });

    it("should export Environments pieces", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const {Environments: result} = await importedModule;

        // Assert
        expect(result).toContainAllKeys(["JSDOMFifteen", "JSDOMSixteen"]);
    });
});
