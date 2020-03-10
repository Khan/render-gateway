// @flow
describe("index.js", () => {
    it("should export what we expect it to export", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const result = await importedModule;

        // Assert
        expect(Object.keys(result).sort()).toEqual(
            [
                "createLogger",
                "extractErrorString",
                "getRequestLogger",
                "getRuntimeMode",
                "startGateway",
                "trace",
            ].sort(),
        );
    });
});
