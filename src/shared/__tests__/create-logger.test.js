// @flow
import winston from "winston";
import {Errors} from "../errors.js";
import {createLogger} from "../create-logger.js";

jest.mock("@google-cloud/logging-winston", () => ({
    LoggingWinston: function () {
        const localWinston = jest.requireActual("winston");
        /**
         * The full LoggingWinston type will cause tests to hang weirdly, so we
         * return a console one but add our little identifier to indicate it
         * is fake.
         */
        const fakeLoggingWinston = new localWinston.transports.Console();
        // We made this up for testing purposes.
        fakeLoggingWinston.__FAKE_LOGGING_WINSTON__ = true;
        return fakeLoggingWinston;
    },
}));

describe("#createLogger", () => {
    describe("during test", () => {
        it("should write to a stream", () => {
            // Arrange
            const mockCreateLogger = jest.spyOn(winston, "createLogger");

            // Act
            createLogger("test", "silly");
            const {transports} = mockCreateLogger.mock.calls[0][0];

            // Assert
            expect(transports).toBeInstanceOf(winston.transports.Stream);
        });

        it("should format log messages to include metadata", () => {
            // Arrange
            jest.spyOn(winston, "createLogger");
            const fakePrintF = jest.fn();
            jest.spyOn(winston.format, "combine", "get").mockReturnValue(
                jest.fn(),
            );
            jest.spyOn(winston.format, "printf", "get").mockReturnValue(
                fakePrintF,
            );

            // Act
            createLogger("test", "silly");
            const result = fakePrintF.mock.calls[0][0]({
                level: "debug",
                message: "MESSAGE",
                other: "metadata",
            });

            // Assert
            expect(result).toMatchInlineSnapshot(`
                "debug: MESSAGE {
                    \\"other\\": \\"metadata\\"
                }"
            `);
        });
    });

    describe("unrecognised runtime mode", () => {
        it("should write to a stream", () => {
            // Arrange
            const mockCreateLogger = jest.spyOn(winston, "createLogger");

            // Act
            createLogger(("MADE UP RUNTIME MODE": any), "silly");
            const {transports} = mockCreateLogger.mock.calls[0][0];

            // Assert
            expect(transports).toBeInstanceOf(winston.transports.Stream);
        });
    });

    describe("during development", () => {
        it("should write to the console", () => {
            // Arrange
            const mockCreateLogger = jest.spyOn(winston, "createLogger");

            // Act
            createLogger("development", "silly");
            const {transports} = mockCreateLogger.mock.calls[0][0];

            // Assert
            expect(transports).toBeInstanceOf(winston.transports.Console);
        });

        it("should format log messages to include metadata", () => {
            // Arrange
            jest.spyOn(winston, "createLogger");
            const fakePrintF = jest.fn();
            jest.spyOn(winston.format, "combine", "get").mockReturnValue(
                jest.fn(),
            );
            jest.spyOn(winston.format, "printf", "get").mockReturnValue(
                fakePrintF,
            );

            // Act
            createLogger("development", "silly");
            const result = fakePrintF.mock.calls[0][0]({
                level: "debug",
                message: "MESSAGE",
                other: "metadata",
            });

            // Assert
            expect(result).toMatchInlineSnapshot(`
                "debug: MESSAGE {
                    \\"other\\": \\"metadata\\"
                }"
            `);
        });
    });

    describe("during production", () => {
        it("should write to stackdriver", () => {
            // Arrange
            const mockCreateLogger = jest.spyOn(winston, "createLogger");

            // Act
            createLogger("production", "silly");
            const {transports} = mockCreateLogger.mock.calls[0][0];

            // Assert
            expect(transports).toHaveProperty("__FAKE_LOGGING_WINSTON__");
        });

        it("should ensure errors get kind metadata", () => {
            // Arrange
            const mockFormat = jest.spyOn(winston, "format");

            // Act
            createLogger("production", "silly");
            const formatter = mockFormat.mock.calls[0][0];
            const result = formatter({level: "error"});

            // Assert
            expect(result).toStrictEqual({
                level: "error",
                kind: Errors.Internal,
            });
        });
    });

    it("should log creation parameters to created logger", () => {
        // Arrange
        const debugSpy = jest.fn();
        jest.spyOn(winston, "createLogger").mockReturnValue({
            debug: debugSpy,
        });

        // Act
        createLogger("test", "info");

        // Assert
        expect(debugSpy).toHaveBeenCalledWith(
            "Created logger (Level=info Mode=test)",
        );
    });
});
