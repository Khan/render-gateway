// @flow
describe("index.js", () => {
    it("should export what we expect it to export", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).toContainAllKeys([
            "Environments",
            "runServer",
            "extractError",
            "Requests",
        ]);
    });

    it("should export Requests API", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const {Requests: result} = await importedModule;

        // Assert
        expect(result).toContainAllKeys(["request", "DefaultRequestOptions"]);
    });
});
