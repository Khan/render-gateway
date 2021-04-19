// @flow
import * as Shared from "../../shared/index.js";
import {makeShouldRetry} from "../make-should-retry.js";

jest.mock("../../shared/index.js");

describe("#makeShouldRetry", () => {
    it("should return a function", () => {
        // Arrange
        const fakeLogger: any = {};

        // Act
        const result = makeShouldRetry(fakeLogger);

        // Assert
        expect(result).toBeFunction();
    });

    describe("returned function", () => {
        it("should extract the error string from the error", () => {
            // Arrange
            const fakeError: any = "FAKE_ERROR";
            const fakeLogger: any = {silly: jest.fn()};
            const fakeResponse: any = {status: "STATUS_CODE"};
            const extractErrorSpy = jest.spyOn(Shared, "extractError");
            const shouldRetry = makeShouldRetry(fakeLogger);

            // Act
            shouldRetry(fakeError, fakeResponse);

            // Assert
            expect(extractErrorSpy).toHaveBeenCalledWith(fakeError);
        });

        it("should log the error and status code to the logger it was created with", () => {
            // Arrange
            const fakeLogger: any = {silly: jest.fn()};
            const fakeResponse: any = {status: "STATUS_CODE"};
            jest.spyOn(Shared, "extractError").mockImplementation((e) => ({
                error: e,
            }));
            const shouldRetry = makeShouldRetry(fakeLogger);

            // Act
            shouldRetry("ERROR", fakeResponse);

            // Assert
            expect(fakeLogger.silly).toHaveBeenCalledWith(
                "Request failed. Might retry.",
                {
                    error: "ERROR",
                    status: "STATUS_CODE",
                },
            );
        });

        it("should up the retry count on the logger if there was an error", () => {
            // Arrange
            const fakeLogger: any = {
                silly: jest.fn(),
                defaultMeta: {retries: 0},
            };
            const fakeResponse: any = {status: "STATUS_CODE"};
            jest.spyOn(Shared, "extractError").mockImplementation((e) => ({
                error: e,
            }));
            const shouldRetry = makeShouldRetry(fakeLogger);

            // Act
            shouldRetry("ERROR", fakeResponse);

            // Assert
            expect(fakeLogger.defaultMeta.retries).toBe(1);
        });

        it("should not log if no error", () => {
            // Arrange
            const fakeLogger: any = {silly: jest.fn()};
            const fakeResponse: any = {status: "STATUS_CODE"};
            const shouldRetry = makeShouldRetry(fakeLogger);

            // Act
            shouldRetry(null, fakeResponse);

            // Assert
            expect(fakeLogger.silly).not.toHaveBeenCalled();
        });

        it("should return undefined when there is no override", () => {
            // Arrange
            const fakeLogger: any = {silly: jest.fn()};
            const fakeResponse: any = {status: "STATUS_CODE"};
            const shouldRetry = makeShouldRetry(fakeLogger);

            // Act
            const result = shouldRetry("ERROR", fakeResponse);

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return the result of the override function", () => {
            // Arrange
            const fakeLogger: any = {silly: jest.fn()};
            const fakeResponse: any = {status: "STATUS_CODE"};
            const overrideFn: any = jest.fn().mockReturnValue("OVERRIDE!");
            const shouldRetry = makeShouldRetry(fakeLogger, overrideFn);

            // Act
            const result = shouldRetry("ERROR", fakeResponse);

            // Assert
            expect(result).toBe("OVERRIDE!");
        });
    });
});
