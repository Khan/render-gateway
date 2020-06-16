// @flow
import * as UseAppEngineMiddleware from "../use-app-engine-middleware.js";
import * as SetupStackdriver from "../setup-stackdriver.js";
import {startGateway} from "../start-gateway.js";
import {createLogger} from "../create-logger.js";

describe("#start-gateway", () => {
    const GAE_SERVICE = process.env.GAE_SERVICE;
    afterEach(() => {
        process.env.GAE_SERVICE = GAE_SERVICE;
    });

    it("should set GAE_SERVICE if it is not set", () => {
        // Arrange
        delete process.env.GAE_SERVICE;
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: createLogger("test", "debug"),
            mode: "test",
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        jest.spyOn(
            UseAppEngineMiddleware,
            "useAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));

        // Act
        startGateway(options, pretendApp);

        // Assert
        expect(process.env.GAE_SERVICE).toBe("TEST_GATEWAY");
    });

    it("should not set GAE_SERVICE if it is already set", () => {
        // Arrange
        process.env.GAE_SERVICE = "GAE_SERVICE_NAME";
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: createLogger("test", "debug"),
            mode: "test",
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        jest.spyOn(
            UseAppEngineMiddleware,
            "useAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));

        // Act
        startGateway(options, pretendApp);

        // Assert
        expect(process.env.GAE_SERVICE).toBe("GAE_SERVICE_NAME");
    });

    it("should setup stackdriver", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: createLogger("test", "debug"),
            mode: "test",
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        jest.spyOn(
            UseAppEngineMiddleware,
            "useAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));
        const setupStackdriverSpy = jest
            .spyOn(SetupStackdriver, "setupStackdriver")
            .mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startGateway(options, pretendApp);

        // Assert
        expect(setupStackdriverSpy).toHaveBeenCalledWith("test");
    });

    it("should add GAE middleware", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: createLogger("test", "debug"),
            mode: "test",
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        const useAppEngineMiddlewareSpy = jest
            .spyOn(UseAppEngineMiddleware, "useAppEngineMiddleware")
            .mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startGateway(options, pretendApp);

        // Assert
        expect(useAppEngineMiddlewareSpy).toHaveBeenCalledWith(
            pretendApp,
            "test",
            options.logger,
        );
    });

    it("should listen on the configured port", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: createLogger("test", "debug"),
            mode: "test",
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        jest.spyOn(
            UseAppEngineMiddleware,
            "useAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startGateway(options, pretendApp);

        // Assert
        expect(pretendApp.listen).toHaveBeenCalledWith(
            42,
            "127.0.0.1",
            expect.any(Function),
        );
    });

    describe("listen callback", () => {
        it("should report start failure if gateway is null", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            await startGateway(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const listenCallback = listenMock.mock.calls[0][2];

            // Act
            listenCallback();

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "TEST_GATEWAY appears not to have started: Unknown error",
            );
        });

        it("should report start failure if there's an error", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            await startGateway(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const listenCallback = listenMock.mock.calls[0][2];

            // Act
            listenCallback(new Error("BOOM 🧨"));

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "TEST_GATEWAY appears not to have started: BOOM 🧨",
            );
        });

        it.each([[null, undefined, "ADDRESS"]])(
            "should report start failure if address is %s",
            async (address) => {
                // Arrange
                const options = {
                    name: "TEST_GATEWAY",
                    port: 42,
                    host: "127.0.0.1",
                    logger: createLogger("test", "debug"),
                    mode: "test",
                };
                const fakeServer = {
                    address: () => address,
                };
                const listenMock = jest.fn().mockReturnValue(fakeServer);
                const pretendApp = ({
                    listen: listenMock,
                }: any);
                jest.spyOn(
                    UseAppEngineMiddleware,
                    "useAppEngineMiddleware",
                ).mockReturnValue(Promise.resolve(pretendApp));
                await startGateway(options, pretendApp);
                const warnSpy = jest.spyOn(options.logger, "warn");
                const listenCallback = listenMock.mock.calls[0][2];

                // Act
                listenCallback();

                // Assert
                expect(warnSpy).toHaveBeenCalledWith(
                    `TEST_GATEWAY may not have started properly: ${address}`,
                );
            },
        );

        it("should report a successful start", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            await startGateway(options, pretendApp);
            const infoSpy = jest.spyOn(options.logger, "info");
            const listenCallback = listenMock.mock.calls[0][2];

            // Act
            listenCallback();

            // Assert
            expect(infoSpy).toHaveBeenCalledWith(
                "TEST_GATEWAY running at http://ADDRESS:PORT",
            );
        });
    });

    describe("shutdown on memory overage", () => {
        const GAE_MEMORY_MB = process.env.GAE_MEMORY_MB;
        const MIN_FREE_MB = process.env.MIN_FREE_MB;
        afterEach(() => {
            process.env.GAE_MEMORY_MB = GAE_MEMORY_MB;
            process.env.MIN_FREE_MB = MIN_FREE_MB;
        });

        it("should do nothing if the memory isn't over", async () => {
            // Arrange
            process.env.GAE_MEMORY_MB = "1024";
            process.env.MIN_FREE_MB = "200";
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const useMock = jest.fn().mockReturnValue(null);
            const pretendApp = ({
                listen: listenMock,
                use: useMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            jest.spyOn(process, "on").mockReturnValue(null);
            jest.spyOn(process, "memoryUsage").mockReturnValue({
                rss: 100 * 1024 * 1024,
            });
            await startGateway(options, pretendApp);
            const infoSpy = jest.spyOn(options.logger, "info");
            const useCallback = useMock.mock.calls[0][0];

            // Act
            useCallback();

            // Assert
            expect(infoSpy).not.toHaveBeenCalledWith(
                "Gracefully shutting down server.",
            );
        });

        it("should do nothing if the gateway doesn't exist", async () => {
            // Arrange
            process.env.GAE_MEMORY_MB = "1024";
            process.env.MIN_FREE_MB = "200";
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const useMock = jest.fn().mockReturnValue(null);
            const pretendApp = ({
                listen: listenMock,
                use: useMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            jest.spyOn(process, "on").mockReturnValue(null);
            jest.spyOn(process, "memoryUsage").mockReturnValue({
                rss: 1025 * 1024 * 1024,
            });
            await startGateway(options, pretendApp);
            const infoSpy = jest.spyOn(options.logger, "info");
            const useCallback = useMock.mock.calls[0][0];

            // Act
            useCallback();

            // Assert
            expect(infoSpy).toHaveBeenCalledWith(
                "Memory usage has gone over maximum. (used: 1074790400), limit: 864026624",
            );
            expect(infoSpy).not.toHaveBeenCalledWith(
                "Gracefully shutting down server.",
            );
        });

        it("should attempt to shutdown the server", async () => {
            // Arrange
            process.env.GAE_MEMORY_MB = "1024";
            process.env.MIN_FREE_MB = "200";
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                close: jest.fn(),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const useMock = jest.fn().mockReturnValue(null);
            const pretendApp = ({
                listen: listenMock,
                use: useMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            jest.spyOn(process, "on").mockReturnValue(null);
            jest.spyOn(process, "memoryUsage").mockReturnValue({
                rss: 1025 * 1024 * 1024,
            });
            await startGateway(options, pretendApp);
            const infoSpy = jest.spyOn(options.logger, "info");
            const useCallback = useMock.mock.calls[0][0];

            // Act
            useCallback();

            // Assert
            expect(infoSpy).toHaveBeenCalledWith(
                "Memory usage has gone over maximum. (used: 1074790400), limit: 864026624",
            );
            expect(infoSpy).toHaveBeenCalledWith(
                "Gracefully shutting down server.",
            );
            expect(fakeServer.close).toHaveBeenCalled();
        });
    });

    describe("close on SIGINT", () => {
        const GAE_MEMORY_MB = process.env.GAE_MEMORY_MB;
        const MIN_FREE_MB = process.env.MIN_FREE_MB;

        beforeEach(() => {
            delete process.env.GAE_MEMORY_MB;
            delete process.env.MIN_FREE_MB;
        });

        afterEach(() => {
            process.env.GAE_MEMORY_MB = GAE_MEMORY_MB;
            process.env.MIN_FREE_MB = MIN_FREE_MB;
        });

        it("should do nothing if the gateway doesn't exist", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            const processSpy = jest.spyOn(process, "on").mockReturnValue(null);
            await startGateway(options, pretendApp);
            const infoSpy = jest.spyOn(options.logger, "info");
            const processCallback = processSpy.mock.calls[0][1];

            // Act
            processCallback();

            // Assert
            expect(infoSpy).toHaveBeenCalledWith("SIGINT received.");
            expect(infoSpy).not.toHaveBeenCalledWith(
                "Gracefully shutting down server.",
            );
        });

        it("should attempt to close the server on SIGINT", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                close: jest.fn(),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            const processSpy = jest.spyOn(process, "on").mockReturnValue(null);
            await startGateway(options, pretendApp);
            const infoSpy = jest.spyOn(options.logger, "info");
            const processCallback = processSpy.mock.calls[0][1];

            // Act
            processCallback();

            // Assert
            expect(infoSpy).toHaveBeenCalledWith("SIGINT received.");
            expect(infoSpy).toHaveBeenCalledWith(
                "Gracefully shutting down server.",
            );
            expect(fakeServer.close).toHaveBeenCalled();
        });

        it("should handle errors from closing the server", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                close: jest.fn(),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            const processOnSpy = jest
                .spyOn(process, "on")
                .mockReturnValue(null);
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startGateway(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const processCallback = processOnSpy.mock.calls[0][1];
            processCallback();
            const closeCallback = fakeServer.close.mock.calls[0][0];

            // Act
            closeCallback(new Error("ERROR"));

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "Error shutting down server: ERROR",
            );
            expect(processExitSpy).toHaveBeenCalledWith(1);
        });

        it("should close gracefully if there is no error", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                close: jest.fn(),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            const processOnSpy = jest
                .spyOn(process, "on")
                .mockReturnValue(null);
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startGateway(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const processCallback = processOnSpy.mock.calls[0][1];
            processCallback();
            const closeCallback = fakeServer.close.mock.calls[0][0];

            // Act
            closeCallback();

            // Assert
            expect(errorSpy).not.toHaveBeenCalled();
            expect(processExitSpy).toHaveBeenCalledWith(0);
        });

        it("should handle .close() throwing an error", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                close: jest.fn().mockImplementation(() => {
                    throw new Error("CLOSE ERROR");
                }),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            const processOnSpy = jest
                .spyOn(process, "on")
                .mockReturnValue(null);
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startGateway(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const processCallback = processOnSpy.mock.calls[0][1];

            // Act
            processCallback();

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "Error closing gateway: CLOSE ERROR",
            );
            expect(processExitSpy).toHaveBeenCalledWith(1);
        });
    });
});
