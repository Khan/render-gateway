// @flow
import {VirtualConsole} from "jsdom";
import * as Shared from "../../../../shared/index.js";
import {createVirtualConsole} from "../create-virtual-console.js";

jest.mock("../../../../shared/index.js");

describe("#createVirtualConsole", () => {
    it("should return a VirtualConsole", () => {
        // Arrange
        const fakeLogger: any = {};

        // Act
        const result = createVirtualConsole(fakeLogger);

        // Assert
        expect(result).toBeInstanceOf(VirtualConsole);
    });

    it("should ignore jsdomError events for 'Could not load img'", () => {
        // Arrange
        const fakeLogger: any = {
            error: jest.fn(),
        };
        const underTest = createVirtualConsole(fakeLogger);

        // Act
        underTest.emit("jsdomError", new Error("Could not load img"));

        // Assert
        expect(fakeLogger.error).not.toHaveBeenCalled();
    });

    it("should report jsdomError events as logger.error", () => {
        // Arrange
        const fakeLogger: any = {
            error: jest.fn(),
        };
        jest.spyOn(Shared, "extractError").mockReturnValue({
            error: "ERROR_MESSAGE",
            stack: "ERROR_STACK",
        });
        const underTest = createVirtualConsole(fakeLogger);

        // Act
        underTest.emit("jsdomError", new Error("This is a jsdomError message"));

        // Assert
        expect(fakeLogger.error).toHaveBeenCalledWith("JSDOM:ERROR_MESSAGE", {
            error: "ERROR_MESSAGE",
            stack: "ERROR_STACK",
        });
    });

    it("should pass errors to logger.error with args as metadata", () => {
        // Arrange
        const fakeLogger: any = {
            error: jest.fn(),
        };
        const underTest = createVirtualConsole(fakeLogger);

        // Act
        underTest.emit(
            "error",
            "This is an error message",
            "and these are args",
        );

        // Assert
        expect(
            fakeLogger.error,
        ).toHaveBeenCalledWith("JSDOM:This is an error message", [
            "and these are args",
        ]);
    });

    it("should pass warn to logger.warn with args as metadata", () => {
        // Arrange
        const fakeLogger: any = {
            warn: jest.fn(),
        };
        const underTest = createVirtualConsole(fakeLogger);

        // Act
        underTest.emit("warn", "This is a warn message", "and these are args");

        // Assert
        expect(
            fakeLogger.warn,
        ).toHaveBeenCalledWith("JSDOM:This is a warn message", [
            "and these are args",
        ]);
    });

    it("should pass info to logger.info with args as metadata", () => {
        // Arrange
        const fakeLogger: any = {
            info: jest.fn(),
        };
        const underTest = createVirtualConsole(fakeLogger);

        // Act
        underTest.emit("info", "This is an info message", "and these are args");

        // Assert
        expect(
            fakeLogger.info,
        ).toHaveBeenCalledWith("JSDOM:This is an info message", [
            "and these are args",
        ]);
    });

    it("should pass log to logger.info with args as metadata", () => {
        // Arrange
        const fakeLogger: any = {
            info: jest.fn(),
        };
        const underTest = createVirtualConsole(fakeLogger);

        // Act
        underTest.emit("log", "This is a log message", "and these are args");

        // Assert
        expect(
            fakeLogger.info,
        ).toHaveBeenCalledWith("JSDOM:This is a log message", [
            "and these are args",
        ]);
    });

    it("should pass debug to logger.debug with args as metadata", () => {
        // Arrange
        const fakeLogger: any = {
            debug: jest.fn(),
        };
        const underTest = createVirtualConsole(fakeLogger);

        // Act
        underTest.emit(
            "debug",
            "This is a debug message",
            "and these are args",
        );

        // Assert
        expect(
            fakeLogger.debug,
        ).toHaveBeenCalledWith("JSDOM:This is a debug message", [
            "and these are args",
        ]);
    });
});
