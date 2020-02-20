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
        beforeEach(() => {
            /**
             * Let's make sure the shared code we use gets used here.
             */
            jest.spyOn(Shared, "getRequestLogger").mockImplementation(
                (...args) => {
                    const realGetRequestLogger = jest.requireActual(
                        "../../shared/index.js",
                    ).getRequestLogger;
                    return realGetRequestLogger(...args);
                },
            );
        });

        it("should return the logger created on import when there is no request", async () => {
            // Arrange
            const {getLogger} = await import("../get-logger.js");

            // Act
            const result = getLogger();

            // Assert
            expect(result).toBe(fakeLogger);
        });

        it("should return the logger created on import when the request has no log", async () => {
            // Arrange
            const {getLogger} = await import("../get-logger.js");

            // Act
            const result = getLogger(({}: any));

            // Assert
            expect(result).toBe(fakeLogger);
        });

        it("should return the request logger when the request has a log", async () => {
            // Arrange
            const {getLogger} = await import("../get-logger.js");
            const pretendRequestLogger = ({}: any);
            const pretendRequest = ({
                log: pretendRequestLogger,
            }: any);

            // Act
            const result = getLogger(pretendRequest);

            // Assert
            expect(result).toBe(pretendRequestLogger);
        });
    });
});
