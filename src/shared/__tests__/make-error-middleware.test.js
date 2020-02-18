//@flow
import * as ExpressWinston from "express-winston";
import {makeErrorMiddleware} from "../make-error-middleware.js";

jest.mock("express-winston");

describe("#makeErrorMiddleware", () => {
    it("should return express-winston error logger", () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendErrorMiddleware = ({}: any);
        jest.spyOn(ExpressWinston, "errorLogger").mockReturnValue(
            pretendErrorMiddleware,
        );

        // Act
        const result = makeErrorMiddleware(pretendLogger);

        // Assert
        expect(result).toBe(pretendErrorMiddleware);
    });

    it("should pass given logger to express winston", () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendErrorMiddleware = ({}: any);
        const errorLoggerSpy = jest
            .spyOn(ExpressWinston, "errorLogger")
            .mockReturnValue(pretendErrorMiddleware);

        // Act
        makeErrorMiddleware(pretendLogger);

        // Assert
        expect(errorLoggerSpy).toHaveBeenCalledWith({
            winstonInstance: pretendLogger,
            level: "error",
        });
    });
});
