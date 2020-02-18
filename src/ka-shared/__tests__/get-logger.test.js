// @flow
import * as Shared from "../../shared/index.js";

/**
 * We have to mock like this, otherwise, we cannot setup spies.
 * This is because the object imported above is read-only and resists our
 * spy setting.
 */
jest.mock("../../shared/index.js");

describe("get-logger.js", () => {
    const fakeLogger = {};

    /**
     * Order matters here.
     *
     * The first test imports the module for the first time and we want to
     * verify that it creates a logger.
     *
     * The second test uses the logger it creates to validate that the same
     * logger is returned from the function.
     */
    it("should create a logger with runtime mode and log level", async () => {
        // Arrange
        jest.spyOn(Shared, "getRuntimeMode").mockReturnValue("test");
        const createLoggerSpy = jest
            .spyOn(Shared, "createLogger")
            .mockReturnValue(fakeLogger);

        // Act
        await import("../get-logger.js");

        // Assert
        expect(createLoggerSpy).toHaveBeenCalledWith("test", "debug");
    });

    describe("#getLogger", () => {
        it("should return the logger created on import", async () => {
            // Arrange
            const {getLogger} = await import("../get-logger.js");

            // Act
            const result = getLogger();

            // Assert
            expect(result).toBe(fakeLogger);
        });
    });
});
