// @flow
describe("index.js", () => {
    it("should export what we expect it to export", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).toContainAllKeys(["runServer", "StatusCodes"]);
    });

    it("should export status codes we expect", async () => {
        // Arrange
        const importedModule = await import("../index.js");

        // Act
        const result = importedModule.StatusCodes;

        // Assert
        expect(result).toContainAllKeys(["ok", "redirect", "notFound"]);
    });
});
