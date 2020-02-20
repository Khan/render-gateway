// @flow
import {getRequestLogger} from "../get-request-logger.js";

describe("#getRequestLogger", () => {
    it("should return the default logger when there is no request", () => {
        // Arrange
        const pretendDefaultLogger = ({}: any);

        // Act
        const result = getRequestLogger(pretendDefaultLogger);

        // Assert
        expect(result).toBe(pretendDefaultLogger);
    });

    it("should return the default logger when the request has no log", () => {
        // Arrange
        const pretendDefaultLogger = ({}: any);

        // Act
        const result = getRequestLogger(pretendDefaultLogger, ({}: any));

        // Assert
        expect(result).toBe(pretendDefaultLogger);
    });

    it("should return the request logger when the request has a log", () => {
        // Arrange
        const pretendDefaultLogger = ({}: any);
        const pretendRequestLogger = ({}: any);
        const pretendRequest = ({
            log: pretendRequestLogger,
        }: any);

        // Act
        const result = getRequestLogger(pretendDefaultLogger, pretendRequest);

        // Assert
        expect(result).toBe(pretendRequestLogger);
    });
});
