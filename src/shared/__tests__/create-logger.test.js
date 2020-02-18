// @flow
import winston from "winston";
import {createLogger} from "../create-logger.js";

jest.mock("@google-cloud/logging-winston", () => ({
    LoggingWinston: function() {
        const localWinston = jest.requireActual("winston");
        /**
         * The full LoggingWinston type will cause tests to hang weirdly, so we
         * return a console one but add our little identifier to indicate it
         * is fake.
         */
        const fakeLoggingWinston = new localWinston.transports.Console();
        // We made this up for testing purposes. $FlowIgnore
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
