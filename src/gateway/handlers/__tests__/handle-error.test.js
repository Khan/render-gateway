// @flow
import * as Shared from "../../../shared/index.js";
import * as FormatError from "../../format-error.js";
import {handleError} from "../handle-error.js";

import type {SimplifiedError} from "../../../shared/index.js";

jest.mock("../../../shared/index.js");
jest.mock("../../format-error.js");

describe("#handleError", () => {
    it("should set the response status to 500", () => {
        // Arrange
        const fakeLogger: any = {
            error: jest.fn(),
        };
        const fakeResponse: any = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
        const fakeRequest: any = {
            query: {url: "THE URL"},
        };
        jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);

        // Act
        handleError(
            "Test",
            undefined,
            undefined,
            fakeRequest,
            fakeResponse,
            new Error("Error!"),
        );

        // Assert
        expect(fakeResponse.status).toHaveBeenCalledWith(500);
    });

    describe("no custom error handler", () => {
        it("should log the uncaught simplified error fields and URL", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
            };
            const simplifiedError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            jest.spyOn(Shared, "extractError").mockReturnValue(simplifiedError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);

            // Act
            handleError(
                "My test error",
                undefined,
                undefined,
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(fakeLogger.error).toHaveBeenCalledWith(
                "My test error; uncaught error",
                {
                    error: "ERROR",
                    requestURL: "THE URL",
                    stack: "STACK",
                },
            );
        });

        it("should format the simplified error", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
            };
            const simplifiedError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            jest.spyOn(Shared, "extractError").mockReturnValue(simplifiedError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            const formatErrorSpy = jest
                .spyOn(FormatError, "formatError")
                .mockReturnValue("FORMATTED ERROR");

            // Act
            handleError(
                "My test error",
                undefined,
                undefined,
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(formatErrorSpy).toHaveBeenCalledWith(
                undefined,
                simplifiedError,
            );
        });

        it("should send the formatted response", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
            };
            const simplifiedError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            jest.spyOn(Shared, "extractError").mockReturnValue(simplifiedError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            jest.spyOn(FormatError, "formatError").mockReturnValue(
                "FORMATTED ERROR",
            );

            // Act
            handleError(
                "My test error",
                undefined,
                undefined,
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(fakeResponse.send).toHaveBeenCalledWith("FORMATTED ERROR");
        });
    });

    describe("with custom handler", () => {
        it("should invoke the custom handler", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
                headers: {"X-HEADER": "VALUE"},
            };
            const simplifiedError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            jest.spyOn(Shared, "extractError").mockReturnValue(simplifiedError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            const customHandler = jest.fn().mockReturnValue(null);

            // Act
            handleError(
                "My test error",
                customHandler,
                undefined,
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(customHandler).toHaveBeenCalledWith(
                "THE URL",
                fakeRequest.headers,
                simplifiedError,
            );
        });
    });

    describe("with custom error handler that returns null", () => {
        it("should log the uncaught simplified error fields and URL", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
                headers: {"X-HEADER": "VALUE"},
            };
            const simplifiedError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            jest.spyOn(Shared, "extractError").mockReturnValue(simplifiedError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            const customHandler = jest.fn().mockReturnValue(null);

            // Act
            handleError(
                "My test error",
                customHandler,
                undefined,
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(fakeLogger.error).toHaveBeenCalledWith(
                "My test error; uncaught error",
                {
                    error: "ERROR",
                    requestURL: "THE URL",
                    stack: "STACK",
                },
            );
        });

        it("should format the simplified error", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
            };
            const simplifiedError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            jest.spyOn(Shared, "extractError").mockReturnValue(simplifiedError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            const customHandler = jest.fn().mockReturnValue(null);
            const formatErrorSpy = jest
                .spyOn(FormatError, "formatError")
                .mockReturnValue("FORMATTED ERROR");

            // Act
            handleError(
                "My test error",
                customHandler,
                "FORMAT_RESPONSE",
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(formatErrorSpy).toHaveBeenCalledWith(
                "FORMAT_RESPONSE",
                simplifiedError,
            );
        });

        it("should send the formatted response", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
            };
            const simplifiedError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            jest.spyOn(Shared, "extractError").mockReturnValue(simplifiedError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            jest.spyOn(FormatError, "formatError").mockReturnValue(
                "FORMATTED ERROR",
            );
            const customHandler = jest.fn().mockReturnValue(null);

            // Act
            handleError(
                "My test error",
                customHandler,
                "FORMAT_RESPONSE",
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(fakeResponse.send).toHaveBeenCalledWith("FORMATTED ERROR");
        });
    });

    describe("with custom error handler that throws error", () => {
        it("should not throw", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
                headers: {"X-HEADER": "VALUE"},
            };
            const simplifiedError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            jest.spyOn(Shared, "extractError").mockReturnValue(simplifiedError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            const customHandler = jest.fn().mockImplementation(() => {
                throw new Error("CUSTOM HANDLER BOOM!");
            });

            // Act
            const underTest = () =>
                handleError(
                    "My test error",
                    customHandler,
                    undefined,
                    fakeRequest,
                    fakeResponse,
                    new Error("Error!"),
                );

            // Assert
            expect(underTest).not.toThrow();
        });

        it("should log original and handler errors", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
                headers: {"X-HEADER": "VALUE"},
            };
            const originalError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            const handlerError: SimplifiedError = {
                error: "INNER ERROR",
                stack: "INNER STACK",
            };
            jest.spyOn(Shared, "extractError")
                .mockReturnValueOnce(originalError)
                .mockReturnValueOnce(handlerError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            const customHandler = jest.fn().mockImplementation(() => {
                throw new Error("CUSTOM HANDLER BOOM!");
            });

            // Act
            handleError(
                "My test error",
                customHandler,
                undefined,
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(fakeLogger.error).toHaveBeenCalledWith(
                "My test error; custom handler failed",
                {
                    error: "INNER ERROR",
                    stack: "INNER STACK",
                    originalError: {
                        error: "ERROR",
                        stack: "STACK",
                    },
                    requestURL: "THE URL",
                },
            );
        });

        it("should format the original and handler errors", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
            };
            const originalError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            const handlerError: SimplifiedError = {
                error: "INNER ERROR",
                stack: "INNER STACK",
            };
            jest.spyOn(Shared, "extractError")
                .mockReturnValueOnce(originalError)
                .mockReturnValueOnce(handlerError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            const customHandler = jest.fn().mockImplementation(() => {
                throw new Error("CUSTOM HANDLER BOOM!");
            });
            const formatErrorSpy = jest
                .spyOn(FormatError, "formatError")
                .mockReturnValue("FORMATTED ERROR");

            // Act
            handleError(
                "My test error",
                customHandler,
                "FORMAT_RESPONSE",
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(formatErrorSpy).toHaveBeenCalledWith("FORMAT_RESPONSE", {
                error: "INNER ERROR",
                stack: "INNER STACK",
                originalError: {
                    error: "ERROR",
                    stack: "STACK",
                },
            });
        });

        it("should send the formatted response", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
            };
            const originalError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            const handlerError: SimplifiedError = {
                error: "INNER ERROR",
                stack: "INNER STACK",
            };
            jest.spyOn(Shared, "extractError")
                .mockReturnValueOnce(originalError)
                .mockReturnValueOnce(handlerError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            jest.spyOn(FormatError, "formatError").mockReturnValue(
                "FORMATTED ERROR",
            );
            const customHandler = jest.fn().mockImplementation(() => {
                throw new Error("CUSTOM HANDLER BOOM!");
            });

            // Act
            handleError(
                "My test error",
                customHandler,
                "FORMAT_RESPONSE",
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(fakeResponse.send).toHaveBeenCalledWith("FORMATTED ERROR");
        });
    });

    describe("with custom error handler that returns response", () => {
        it("should log that an error occurred", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
                header: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
                headers: {"X-HEADER": "VALUE"},
            };
            const simplifiedError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            jest.spyOn(Shared, "extractError").mockReturnValue(simplifiedError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            const customHandler = jest.fn().mockReturnValue({
                body: "My custom response",
                headers: {
                    "X-HEADER-1": "VALUE",
                    "X-HEADER-2": "VALUE2",
                },
            });

            // Act
            handleError(
                "TEST",
                customHandler,
                undefined,
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(fakeLogger.error).toHaveBeenCalledWith(
                "TEST; custom error response generated",
                {
                    requestURL: "THE URL",
                    error: "ERROR",
                    stack: "STACK",
                },
            );
        });

        it("should send custom response in response", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
                header: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
                headers: {"X-HEADER": "VALUE"},
            };
            const simplifiedError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            jest.spyOn(Shared, "extractError").mockReturnValue(simplifiedError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            const customHandler = jest.fn().mockReturnValue({
                body: "My custom response",
                headers: {
                    "X-HEADER-1": "VALUE",
                    "X-HEADER-2": "VALUE2",
                },
            });

            // Act
            handleError(
                "TEST",
                customHandler,
                undefined,
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(fakeResponse.send).toHaveBeenCalledWith(
                "My custom response",
            );
        });

        it("should send custom response headers in response", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeResponse: any = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
                header: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {url: "THE URL"},
                headers: {"X-HEADER": "VALUE"},
            };
            const simplifiedError: SimplifiedError = {
                error: "ERROR",
                stack: "STACK",
            };
            jest.spyOn(Shared, "extractError").mockReturnValue(simplifiedError);
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
            const customHandler = jest.fn().mockReturnValue({
                body: "My custom response",
                headers: {
                    "X-HEADER-1": "VALUE",
                    "X-HEADER-2": "VALUE2",
                },
            });

            // Act
            handleError(
                "TEST",
                customHandler,
                undefined,
                fakeRequest,
                fakeResponse,
                new Error("Error!"),
            );

            // Assert
            expect(fakeResponse.header).toHaveBeenCalledWith({
                "X-HEADER-1": "VALUE",
                "X-HEADER-2": "VALUE2",
            });
        });
    });
});
