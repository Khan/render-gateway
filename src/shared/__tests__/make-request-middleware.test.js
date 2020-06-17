// @flow
import * as ExpressWinston from "express-winston";
import * as LoggingWinston from "@google-cloud/logging-winston";
import {makeRequestMiddleware} from "../make-request-middleware.js";

jest.mock("express-winston");
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
    express: {
        makeMiddleware: jest.fn(),
    },
}));

describe("#makeRequestMiddleware", () => {
    describe("when in production", () => {
        it("should return logging-winston middleware", async () => {
            // Arrange
            const pretendLogger = ({}: any);
            const pretendLoggingWinstonMiddleware = ({}: any);
            jest.spyOn(
                LoggingWinston.express,
                "makeMiddleware",
            ).mockReturnValue(pretendLoggingWinstonMiddleware);

            // Act
            const result = await makeRequestMiddleware(
                "production",
                pretendLogger,
            );

            // Assert
            expect(result).toBe(pretendLoggingWinstonMiddleware);
        });

        it("should create middleware with logger and transport", async () => {
            // Arrange
            const pretendLogger = ({}: any);
            const pretendLoggingWinstonMiddleware = ({}: any);
            const middlewareSpy = jest
                .spyOn(LoggingWinston.express, "makeMiddleware")
                .mockReturnValue(pretendLoggingWinstonMiddleware);

            // Act
            await makeRequestMiddleware("production", pretendLogger);

            // Assert
            expect(middlewareSpy).toHaveBeenCalledWith(
                pretendLogger,
                expect.objectContaining({__FAKE_LOGGING_WINSTON__: true}),
            );
        });
    });

    describe("when not in production", () => {
        it("should return express-winston middleware", async () => {
            // Arrange
            const pretendLogger = ({}: any);
            const pretendExpressWinstonMiddleware = ({}: any);
            jest.spyOn(ExpressWinston, "logger").mockReturnValue(
                pretendExpressWinstonMiddleware,
            );

            // Act
            const result = await makeRequestMiddleware(
                "development",
                pretendLogger,
            );

            // Assert
            expect(result).toBe(pretendExpressWinstonMiddleware);
        });

        it("should create middleware with logger", async () => {
            // Arrange
            const pretendLogger = ({}: any);
            const pretendExpressWinstonMiddleware = ({}: any);
            const middlewareSpy = jest
                .spyOn(ExpressWinston, "logger")
                .mockReturnValue(pretendExpressWinstonMiddleware);

            // Act
            await makeRequestMiddleware("development", pretendLogger);

            // Assert
            expect(middlewareSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    winstonInstance: pretendLogger,
                }),
            );
        });
    });
});
