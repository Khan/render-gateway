// @flow
import {patchAgainstDanglingTimers} from "../patch-against-dangling-timers.js";
import type {IGate} from "../types.js";

describe("#patchAgainstDanglingTimers", () => {
    it("should return a gate for controlling the timers", () => {
        // Arrange
        const fakeWindow = {
            setTimeout: jest.fn(),
            setInterval: jest.fn(),
            requestAnimationFrame: jest.fn(),
        };

        // Act
        const result: IGate = patchAgainstDanglingTimers(fakeWindow);

        // Assert
        expect(result).toStrictEqual({
            open: expect.any(Function),
            close: expect.any(Function),
            isOpen: true,
        });
    });

    describe("#setTimeout", () => {
        it("should be patched", () => {
            // Arrange
            const fakeSetTimeout = jest.fn();
            const fakeWindow = {
                setTimeout: fakeSetTimeout,
                setInterval: jest.fn(),
                requestAnimationFrame: jest.fn(),
            };

            // Act
            patchAgainstDanglingTimers(fakeWindow);

            // Assert
            expect(fakeWindow.setTimeout).not.toBe(fakeSetTimeout);
        });

        it("should call the original function", () => {
            // Arrange
            const fakeSetTimeout = jest.fn();
            const fakeWindow = {
                setTimeout: fakeSetTimeout,
                setInterval: jest.fn(),
                requestAnimationFrame: jest.fn(),
            };

            // Act
            patchAgainstDanglingTimers(fakeWindow);
            fakeWindow.setTimeout(jest.fn(), 0);

            // Assert
            expect(fakeSetTimeout).toHaveBeenCalledWith(
                expect.any(Function),
                0,
            );
        });

        it("should return the result of original function", () => {
            // Arrange
            const fakeSetTimeout = jest.fn().mockReturnValue(42);
            const fakeWindow = {
                setTimeout: fakeSetTimeout,
                setInterval: jest.fn(),
                requestAnimationFrame: jest.fn(),
            };

            // Act
            patchAgainstDanglingTimers(fakeWindow);
            const result = fakeWindow.setTimeout(jest.fn(), 0);

            // Assert
            expect(result).toBe(42);
        });

        describe("gate open", () => {
            it("should execute callback", () => {
                // Arrange
                const fakeSetTimeout = jest.fn();
                const fakeWindow = {
                    setTimeout: fakeSetTimeout,
                    setInterval: jest.fn(),
                    requestAnimationFrame: jest.fn(),
                };
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.open();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.setTimeout(actualCallback);
                const registeredCallback = fakeSetTimeout.mock.calls[0][0];
                registeredCallback();

                // Assert
                expect(actualCallback).toHaveBeenCalledTimes(1);
            });
        });

        describe("gate closed", () => {
            it("should not execute callback", () => {
                // Arrange
                const fakeSetTimeout = jest.fn();
                const fakeWindow = {
                    setTimeout: fakeSetTimeout,
                    setInterval: jest.fn(),
                    requestAnimationFrame: jest.fn(),
                };
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.close();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.setTimeout(actualCallback);
                const registeredCallback = fakeSetTimeout.mock.calls[0][0];
                registeredCallback();

                // Assert
                expect(actualCallback).not.toHaveBeenCalled();
            });

            it("should warn about dangling timer", () => {
                // Arrange
                const fakeSetTimeout = jest.fn();
                const fakeWindow = {
                    setTimeout: fakeSetTimeout,
                    setInterval: jest.fn(),
                    requestAnimationFrame: jest.fn(),
                };
                const warnSpy = jest.spyOn(console, "warn");
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.close();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.setTimeout(actualCallback);
                const registeredCallback = fakeSetTimeout.mock.calls[0][0];
                registeredCallback();

                // Assert
                expect(warnSpy).toHaveBeenCalledWith(
                    "Dangling timer(s) detected",
                );
            });

            it("should only warn once about a dangling timer", () => {
                // Arrange
                const fakeSetTimeout = jest.fn();
                const fakeWindow = {
                    setTimeout: fakeSetTimeout,
                    setInterval: jest.fn(),
                    requestAnimationFrame: jest.fn(),
                };
                const warnSpy = jest.spyOn(console, "warn");
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.close();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.setTimeout(actualCallback);
                const registeredCallback = fakeSetTimeout.mock.calls[0][0];
                registeredCallback();
                registeredCallback();
                registeredCallback();

                // Assert
                expect(warnSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("#setInterval", () => {
        it("should be patched", () => {
            // Arrange
            const fakeSetInterval = jest.fn();
            const fakeWindow = {
                setInterval: fakeSetInterval,
                setTimeout: jest.fn(),
                requestAnimationFrame: jest.fn(),
            };

            // Act
            patchAgainstDanglingTimers(fakeWindow);

            // Assert
            expect(fakeWindow.setInterval).not.toBe(fakeSetInterval);
        });

        it("should call the original function", () => {
            // Arrange
            const fakeSetInterval = jest.fn();
            const fakeWindow = {
                setInterval: fakeSetInterval,
                setTimeout: jest.fn(),
                requestAnimationFrame: jest.fn(),
            };

            // Act
            patchAgainstDanglingTimers(fakeWindow);
            fakeWindow.setInterval(jest.fn(), 100);

            // Assert
            expect(fakeSetInterval).toHaveBeenCalledWith(
                expect.any(Function),
                100,
            );
        });

        it("should return the result of original function", () => {
            // Arrange
            const fakeSetInterval = jest.fn().mockReturnValue(1000000);
            const fakeWindow = {
                setInterval: fakeSetInterval,
                setTimeout: jest.fn(),
                requestAnimationFrame: jest.fn(),
            };

            // Act
            patchAgainstDanglingTimers(fakeWindow);
            const result = fakeWindow.setInterval(jest.fn(), 100);

            // Assert
            expect(result).toBe(1000000);
        });

        describe("gate open", () => {
            it("should execute callback", () => {
                // Arrange
                const fakeSetInterval = jest.fn();
                const fakeWindow = {
                    setInterval: fakeSetInterval,
                    setTimeout: jest.fn(),
                    requestAnimationFrame: jest.fn(),
                };
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.open();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.setInterval(actualCallback);
                const registeredCallback = fakeSetInterval.mock.calls[0][0];
                registeredCallback();

                // Assert
                expect(actualCallback).toHaveBeenCalledTimes(1);
            });
        });

        describe("gate closed", () => {
            it("should not execute callback", () => {
                // Arrange
                const fakeSetInterval = jest.fn();
                const fakeWindow = {
                    setInterval: fakeSetInterval,
                    setTimeout: jest.fn(),
                    requestAnimationFrame: jest.fn(),
                };
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.close();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.setInterval(actualCallback);
                const registeredCallback = fakeSetInterval.mock.calls[0][0];
                registeredCallback();

                // Assert
                expect(actualCallback).not.toHaveBeenCalled();
            });

            it("should warn about dangling timer", () => {
                // Arrange
                const fakeSetInterval = jest.fn();
                const fakeWindow = {
                    setInterval: fakeSetInterval,
                    setTimeout: jest.fn(),
                    requestAnimationFrame: jest.fn(),
                };
                const warnSpy = jest.spyOn(console, "warn");
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.close();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.setInterval(actualCallback);
                const registeredCallback = fakeSetInterval.mock.calls[0][0];
                registeredCallback();

                // Assert
                expect(warnSpy).toHaveBeenCalledWith(
                    "Dangling timer(s) detected",
                );
            });

            it("should only warn once about a dangling timer", () => {
                // Arrange
                const fakeSetInterval = jest.fn();
                const fakeWindow = {
                    setInterval: fakeSetInterval,
                    setTimeout: jest.fn(),
                    requestAnimationFrame: jest.fn(),
                };
                const warnSpy = jest.spyOn(console, "warn");
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.close();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.setInterval(actualCallback);
                const registeredCallback = fakeSetInterval.mock.calls[0][0];
                registeredCallback();
                registeredCallback();
                registeredCallback();

                // Assert
                expect(warnSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("#requestAnimationFrame", () => {
        it("should be patched", () => {
            // Arrange
            const fakeRequestAnimationFrame = jest.fn();
            const fakeWindow = {
                requestAnimationFrame: fakeRequestAnimationFrame,
                setInterval: jest.fn(),
                setTimeout: jest.fn(),
            };

            // Act
            patchAgainstDanglingTimers(fakeWindow);

            // Assert
            expect(fakeWindow.requestAnimationFrame).not.toBe(
                fakeRequestAnimationFrame,
            );
        });

        it("should call the original function", () => {
            // Arrange
            const fakeRequestAnimationFrame = jest.fn();
            const fakeWindow = {
                requestAnimationFrame: fakeRequestAnimationFrame,
                setInterval: jest.fn(),
                setTimeout: jest.fn(),
            };

            // Act
            patchAgainstDanglingTimers(fakeWindow);
            fakeWindow.requestAnimationFrame(jest.fn());

            // Assert
            expect(fakeRequestAnimationFrame).toHaveBeenCalledWith(
                expect.any(Function),
            );
        });

        it("should return the result of original function", () => {
            // Arrange
            const fakeRequestAnimationFrame = jest.fn().mockReturnValue(200);
            const fakeWindow = {
                requestAnimationFrame: fakeRequestAnimationFrame,
                setInterval: jest.fn(),
                setTimeout: jest.fn(),
            };

            // Act
            patchAgainstDanglingTimers(fakeWindow);
            const result = fakeWindow.requestAnimationFrame(jest.fn());

            // Assert
            expect(result).toBe(200);
        });

        describe("gate open", () => {
            it("should execute callback", () => {
                // Arrange
                const fakeRequestAnimationFrame = jest.fn();
                const fakeWindow = {
                    requestAnimationFrame: fakeRequestAnimationFrame,
                    setTimeout: jest.fn(),
                    setInterval: jest.fn(),
                };
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.open();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.requestAnimationFrame(actualCallback);
                const registeredCallback =
                    fakeRequestAnimationFrame.mock.calls[0][0];
                registeredCallback();

                // Assert
                expect(actualCallback).toHaveBeenCalledTimes(1);
            });
        });

        describe("gate closed", () => {
            it("should not execute callback", () => {
                // Arrange
                const fakeRequestAnimationFrame = jest.fn();
                const fakeWindow = {
                    requestAnimationFrame: fakeRequestAnimationFrame,
                    setTimeout: jest.fn(),
                    setInterval: jest.fn(),
                };
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.close();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.requestAnimationFrame(actualCallback);
                const registeredCallback =
                    fakeRequestAnimationFrame.mock.calls[0][0];
                registeredCallback();

                // Assert
                expect(actualCallback).not.toHaveBeenCalled();
            });

            it("should warn about dangling timer", () => {
                // Arrange
                const fakeRequestAnimationFrame = jest.fn();
                const fakeWindow = {
                    requestAnimationFrame: fakeRequestAnimationFrame,
                    setTimeout: jest.fn(),
                    setInterval: jest.fn(),
                };
                const warnSpy = jest.spyOn(console, "warn");
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.close();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.requestAnimationFrame(actualCallback);
                const registeredCallback =
                    fakeRequestAnimationFrame.mock.calls[0][0];
                registeredCallback();

                // Assert
                expect(warnSpy).toHaveBeenCalledWith(
                    "Dangling timer(s) detected",
                );
            });

            it("should only warn once about a dangling timer", () => {
                // Arrange
                const fakeRequestAnimationFrame = jest.fn();
                const fakeWindow = {
                    requestAnimationFrame: fakeRequestAnimationFrame,
                    setTimeout: jest.fn(),
                    setInterval: jest.fn(),
                };
                const warnSpy = jest.spyOn(console, "warn");
                const gate = patchAgainstDanglingTimers(fakeWindow);
                gate.close();
                const actualCallback = jest.fn();

                // Act
                fakeWindow.requestAnimationFrame(actualCallback);
                const registeredCallback =
                    fakeRequestAnimationFrame.mock.calls[0][0];
                registeredCallback();
                registeredCallback();
                registeredCallback();

                // Assert
                expect(warnSpy).toHaveBeenCalledTimes(1);
            });
        });
    });
});
