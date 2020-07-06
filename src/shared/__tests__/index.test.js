// @flow
describe("index.js", () => {
    it("should export what we expect it to export", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).toContainAllKeys([
            "createLogger",
            "getLogger",
            "extractError",
            "getGatewayInfo",
            "getRequestLogger",
            "getRuntimeMode",
            "startGateway",
            "trace",
            "getAgentForURL",
        ]);
    });
});
