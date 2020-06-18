// @flow
import * as Express from "express";
import * as ExpressAsyncHandler from "express-async-handler";
import * as MakeErrorMiddleware from "../middleware/make-error-middleware.js";
import * as MakeAppEngineRequestIDMiddleware from "../middleware/make-app-engine-request-id-middleware.js";
import * as MakeRequestMiddleware from "../middleware/make-request-middleware.js";
import * as MakeMemoryMonitoringMiddleware from "../middleware/make-memory-monitoring-middleware.js";
import {useAppEngineMiddleware} from "../use-app-engine-middleware.js";

jest.mock("express");
jest.mock("express-async-handler");
jest.mock("../middleware/make-error-middleware.js");
jest.mock("../middleware/make-request-middleware.js");
jest.mock("../middleware/make-memory-monitoring-middleware.js");

describe("#useAppEngineMiddleware", () => {
    it("should use the passed application", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);

        // Act
        await useAppEngineMiddleware(pretendApp, "test", pretendLogger);

        // Assert
        expect(newApp.use).toHaveBeenCalledWith(pretendApp);
    });

    it("should add error middleware", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const pretendErrorMiddleware = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);
        jest.spyOn(MakeErrorMiddleware, "makeErrorMiddleware").mockReturnValue(
            pretendErrorMiddleware,
        );

        // Act
        await useAppEngineMiddleware(pretendApp, "test", pretendLogger);

        // Assert
        expect(newApp.use).toHaveBeenCalledWith(pretendErrorMiddleware);
    });

    it("should pass logger to error middleware", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const pretendErrorMiddleware = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);
        const makeErrorMiddlewareSpy = jest
            .spyOn(MakeErrorMiddleware, "makeErrorMiddleware")
            .mockReturnValue(pretendErrorMiddleware);

        // Act
        await useAppEngineMiddleware(pretendApp, "test", pretendLogger);

        // Assert
        expect(makeErrorMiddlewareSpy).toHaveBeenCalledWith(pretendLogger);
    });

    it("should add requestID middleware", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const pretendMiddleware = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);
        jest.spyOn(
            MakeAppEngineRequestIDMiddleware,
            "makeAppEngineRequestIDMiddleware",
        ).mockReturnValue(pretendMiddleware);

        // Act
        await useAppEngineMiddleware(pretendApp, "test", pretendLogger);

        // Assert
        expect(newApp.use).toHaveBeenCalledWith(pretendMiddleware);
    });

    it("should pass logger to requestID middleware", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const pretendMiddleware = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);
        const makeMiddlewareSpy = jest
            .spyOn(
                MakeAppEngineRequestIDMiddleware,
                "makeAppEngineRequestIDMiddleware",
            )
            .mockReturnValue(pretendMiddleware);

        // Act
        await useAppEngineMiddleware(pretendApp, "test", pretendLogger);

        // Assert
        expect(makeMiddlewareSpy).toHaveBeenCalledWith(pretendLogger);
    });

    it("should add request middleware", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const pretendRequestMiddleware = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);
        jest.spyOn(
            MakeRequestMiddleware,
            "makeRequestMiddleware",
        ).mockReturnValue(Promise.resolve(pretendRequestMiddleware));

        // Act
        await useAppEngineMiddleware(pretendApp, "test", pretendLogger);

        // Assert
        expect(newApp.use).toHaveBeenCalledWith(pretendRequestMiddleware);
    });

    it("should pass logger and mode to request middleware", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const pretendRequestMiddleware = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);
        const makeRequestMiddlewareSpy = jest
            .spyOn(MakeRequestMiddleware, "makeRequestMiddleware")
            .mockReturnValue(Promise.resolve(pretendRequestMiddleware));

        // Act
        await useAppEngineMiddleware(pretendApp, "test", pretendLogger);

        // Assert
        expect(makeRequestMiddlewareSpy).toHaveBeenCalledWith(
            "test",
            pretendLogger,
        );
    });

    it("should add memory management middleware wrapped with async handler", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);

        /**
         * To check that the middleware is what gets wrapped, we're going
         * to mock one to just be a function that returns a string, and then
         * mock the wrapper to return a version of that string. Then we can
         * confirm that they were combined for our test expectation.
         */
        jest.spyOn(
            MakeMemoryMonitoringMiddleware,
            "makeMemoryMonitoringMiddleware",
        ).mockReturnValue(() => "MEMORY_MONITOR");
        jest.spyOn(ExpressAsyncHandler, "default").mockImplementation(
            (pretendFn) => `ASYNC_HANDLER:${pretendFn()}`,
        );

        // Act
        await useAppEngineMiddleware(pretendApp, "test", pretendLogger);

        // Assert
        expect(newApp.use).toHaveBeenCalledWith("ASYNC_HANDLER:MEMORY_MONITOR");
    });

    it("should pass logger memory management middleware", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);
        const makeMemoryMonitoringMiddlewareSpy = jest
            .spyOn(
                MakeMemoryMonitoringMiddleware,
                "makeMemoryMonitoringMiddleware",
            )
            .mockReturnValue(() => "MEMORY_MONITOR");
        jest.spyOn(ExpressAsyncHandler, "default").mockImplementation(
            (pretendFn) => `ASYNC_HANDLER:${pretendFn()}`,
        );

        // Act
        await useAppEngineMiddleware(pretendApp, "test", pretendLogger);

        // Assert
        expect(makeMemoryMonitoringMiddlewareSpy).toHaveBeenCalledWith(
            pretendLogger,
        );
    });

    it("should return the updated application", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);

        // Act
        const result = await useAppEngineMiddleware(
            pretendApp,
            "test",
            pretendLogger,
        );

        // Assert
        expect(result).toBe(newApp);
    });
});
