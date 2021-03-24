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
        expect(fakeLogger.error).toHaveBeenCalledWith(
            "JSDOM jsdomError:ERROR_MESSAGE",
            {
                error: "ERROR_MESSAGE",
                kind: "Internal",
                stack: "ERROR_STACK",
            },
        );
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
        expect(fakeLogger.error).toHaveBeenCalledWith(
            "JSDOM error:This is an error message",
            {
                args: ["and these are args"],
            },
        );
    });

    it.each(["warn", "info", "log", "debug"])(
        "should pass %s through to logger silly with args as metadata",
        (method: string) => {
            // Arrange
            const fakeLogger: any = {
                silly: jest.fn(),
            };
            const underTest = createVirtualConsole(fakeLogger);

            // Act
            underTest.emit(
                method,
                "This is a logged message",
                "and these are args",
            );

            // Assert
            expect(fakeLogger.silly).toHaveBeenCalledWith(
                `JSDOM ${method}:This is a logged message`,
                {
                    args: ["and these are args"],
                },
            );
        },
    );
});
