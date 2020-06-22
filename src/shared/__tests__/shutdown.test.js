// @flow
describe("#gatewayStarted", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it("should throw if called more than once", () => {
        // Arrange
        const {gatewayStarted} = require("../shutdown.js");
        gatewayStarted(({}: any));

        // Act
        const underTest = () => gatewayStarted(({}: any));

        // Assert
        expect(underTest).toThrowErrorMatchingInlineSnapshot(
            `"Gateway already started."`,
        );
    });
});

describe("#shutdownGateway", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it("should exit 0 if gateway not started", async () => {
        // Arrange
        const {shutdownGateway} = require("../shutdown.js");
        const logFn = jest.fn();
        const fakeLogger: any = {
            info: logFn,
            error: logFn,
            debug: logFn,
        };
        jest.spyOn(process, "exit").mockImplementation(() => {});

        // Act
        await shutdownGateway(fakeLogger);

        // Assert
        expect(process.exit).toHaveBeenCalledWith(0);
        expect(logFn).not.toHaveBeenCalled();
    });

    it("should log pending closure when gateway started", async () => {
        // Arrange
        const {gatewayStarted, shutdownGateway} = require("../shutdown.js");
        const fakeLogger: any = {
            info: jest.fn().mockImplementation((msg, cb) => cb()),
            error: jest.fn().mockImplementation((msg, meta, cb) => cb()),
            debug: jest.fn(),
        };
        const fakeGateway: any = {
            close: jest.fn().mockImplementation((cb) => cb()),
        };
        jest.spyOn(process, "exit").mockImplementation(() => {});
        gatewayStarted(fakeGateway);

        // Act
        await shutdownGateway(fakeLogger);

        // Assert
        expect(fakeLogger.debug).toHaveBeenCalledWith("Closing gateway.");
    });

    it("should call close on gateway", async () => {
        // Arrange
        const {gatewayStarted, shutdownGateway} = require("../shutdown.js");
        const fakeLogger: any = {
            info: jest.fn().mockImplementation((msg, cb) => cb()),
            error: jest.fn().mockImplementation((msg, meta, cb) => cb()),
            debug: jest.fn(),
        };
        const fakeGateway: any = {
            close: jest.fn().mockImplementation((cb) => cb()),
        };
        jest.spyOn(process, "exit").mockImplementation(() => {});
        gatewayStarted(fakeGateway);

        // Act
        await shutdownGateway(fakeLogger);

        // Assert
        expect(fakeGateway.close).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should send a 'offline' message", async () => {
        // Arrange
        const {gatewayStarted, shutdownGateway} = require("../shutdown.js");
        const fakeLogger: any = {
            info: jest.fn().mockImplementation((msg, cb) => cb()),
            error: jest.fn().mockImplementation((msg, meta, cb) => cb()),
            debug: jest.fn(),
        };
        const fakeGateway: any = {
            close: jest.fn().mockImplementation((cb) => cb()),
        };
        const sendSpy = jest.spyOn(process, "send").mockReturnValue(null);
        jest.spyOn(process, "exit").mockImplementation(() => {});
        gatewayStarted(fakeGateway);

        // Act
        await shutdownGateway(fakeLogger);

        // Assert
        expect(sendSpy).toHaveBeenCalledWith("offline");
    });

    describe("when gateway close errors", () => {
        it("should log error", async () => {
            // Arrange
            const {gatewayStarted, shutdownGateway} = require("../shutdown.js");
            const fakeLogger: any = {
                info: jest.fn().mockImplementation((msg, cb) => cb()),
                error: jest.fn().mockImplementation((msg, meta, cb) => cb()),
                debug: jest.fn(),
            };
            const fakeGateway: any = {
                close: jest
                    .fn()
                    .mockImplementation((cb) =>
                        cb(new Error("BAD GATEWAY CLOSE")),
                    ),
            };
            jest.spyOn(process, "exit").mockImplementation(() => {});
            gatewayStarted(fakeGateway);

            // Act
            await shutdownGateway(fakeLogger);

            // Assert
            expect(fakeLogger.error).toHaveBeenCalledWith(
                "Error closing gateway",
                {
                    error: "Error: BAD GATEWAY CLOSE",
                    stack: expect.any(String),
                },
                expect.any(Function),
            );
        });

        it("should exit 1", async () => {
            // Arrange
            const {gatewayStarted, shutdownGateway} = require("../shutdown.js");
            const fakeLogger: any = {
                info: jest.fn().mockImplementation((msg, cb) => cb()),
                error: jest.fn().mockImplementation((msg, meta, cb) => cb()),
                debug: jest.fn(),
            };
            const fakeGateway: any = {
                close: jest
                    .fn()
                    .mockImplementation((cb) =>
                        cb(new Error("BAD GATEWAY CLOSE")),
                    ),
            };
            const exitSpy = jest
                .spyOn(process, "exit")
                .mockImplementation(() => {});
            gatewayStarted(fakeGateway);

            // Act
            await shutdownGateway(fakeLogger);

            // Assert
            expect(exitSpy).toHaveBeenCalledWith(1);
        });

        it("should log if the gateway is already closed", async () => {
            // Arrange
            const {gatewayStarted, shutdownGateway} = require("../shutdown.js");
            const fakeLogger: any = {
                info: jest.fn().mockImplementation((msg, cb) => cb()),
                error: jest.fn().mockImplementation((msg, meta, cb) => cb()),
                debug: jest.fn(),
            };
            const fakeGateway: any = {
                close: jest
                    .fn()
                    .mockImplementation((cb) =>
                        cb(
                            new Error(
                                "Error [ERR_SERVER_NOT_RUNNING]: Server is not running.",
                            ),
                        ),
                    ),
            };
            jest.spyOn(process, "exit").mockImplementation(() => {});
            gatewayStarted(fakeGateway);

            // Act
            await shutdownGateway(fakeLogger);

            // Assert
            expect(fakeLogger.info).toHaveBeenCalledWith(
                "Gateway already closed.",
                expect.any(Function),
            );
        });
    });

    describe("when gateway close succeeds", () => {
        it("should log exit", async () => {
            // Arrange
            const {gatewayStarted, shutdownGateway} = require("../shutdown.js");
            const fakeLogger: any = {
                info: jest.fn().mockImplementation((msg, cb) => cb()),
                error: jest.fn().mockImplementation((msg, meta, cb) => cb()),
                debug: jest.fn(),
            };
            const fakeGateway: any = {
                close: jest.fn().mockImplementation((cb) => cb()),
            };
            jest.spyOn(process, "exit").mockImplementation(() => {});
            gatewayStarted(fakeGateway);

            // Act
            await shutdownGateway(fakeLogger);

            // Assert
            expect(fakeLogger.info).toHaveBeenCalledWith(
                "Gateway closed. Shutting down process.",
                expect.any(Function),
            );
        });

        it("should exit 1", async () => {
            // Arrange
            const {gatewayStarted, shutdownGateway} = require("../shutdown.js");
            const fakeLogger: any = {
                info: jest.fn().mockImplementation((msg, cb) => cb()),
                error: jest.fn().mockImplementation((msg, meta, cb) => cb()),
                debug: jest.fn(),
            };
            const fakeGateway: any = {
                close: jest.fn().mockImplementation((cb) => cb()),
            };
            const exitSpy = jest
                .spyOn(process, "exit")
                .mockImplementation(() => {});
            gatewayStarted(fakeGateway);

            // Act
            await shutdownGateway(fakeLogger);

            // Assert
            expect(exitSpy).toHaveBeenCalledWith(0);
        });
    });
});
