// @flow
import * as Express from "express";
import {useAppEngineMiddleware} from "../use-app-engine-middleware.js";

jest.mock("express");

describe("#useAppEngineMiddleware", () => {
    it("should use the passed application", () => {
        // Arrange
        const pretendApp = ({}: any);
        const mockUseFn = jest.fn();
        jest.spyOn(Express, "default").mockReturnValue({
            use: mockUseFn,
        });

        // Act
        useAppEngineMiddleware(pretendApp);

        // Assert
        expect(mockUseFn).toHaveBeenCalledWith(pretendApp);
    });

    it("should return the updated application", () => {
        // Arrange
        const pretendApp = ({}: any);
        const newApp = ({
            use: jest.fn(() => newApp),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);

        // Act
        const result = useAppEngineMiddleware(pretendApp);

        // Assert
        expect(result).toBe(newApp);
    });
});
