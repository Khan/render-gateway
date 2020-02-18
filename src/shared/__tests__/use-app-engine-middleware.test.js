// @flow
import * as Express from "express";
import * as MakeErrorMiddleware from "../make-error-middleware.js";
import {useAppEngineMiddleware} from "../use-app-engine-middleware.js";

jest.mock("express");

describe("#useAppEngineMiddleware", () => {
    it("should use the passed application", () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);

        // Act
        useAppEngineMiddleware(pretendApp, pretendLogger);

        // Assert
        expect(newApp.use).toHaveBeenCalledWith(pretendApp);
    });

    it("should add error middleware", () => {
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
        useAppEngineMiddleware(pretendApp, pretendLogger);

        // Assert
        expect(newApp.use).toHaveBeenCalledWith(pretendErrorMiddleware);
    });

    it("should pass logger to error middleware", () => {
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
        useAppEngineMiddleware(pretendApp, pretendLogger);

        // Assert
        expect(makeErrorMiddlewareSpy).toHaveBeenCalledWith(pretendLogger);
    });

    it("should return the updated application", () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendApp = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);

        // Act
        const result = useAppEngineMiddleware(pretendApp, pretendLogger);

        // Assert
        expect(result).toBe(newApp);
    });
});
