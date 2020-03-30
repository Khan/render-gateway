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
            "Requests",
        ]);
    });

    it("should export Requests API", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const {Requests: result} = await importedModule;

        // Assert
        expect(result).toContainAllKeys([
            "request",
            "abortInFlightRequests",
            "DefaultRequestOptions",
        ]);
    });

    it("should export Environments", async () => {
        // Arrange
        const importedModule = import("../index.js");

        // Act
        const {Environments: result} = await importedModule;

        // Assert
        expect(result).toContainAllKeys([
            "JSDOMSixteenEnvironment",
            "JSDOMSixteenResourceLoader",
        ]);
    });
});
