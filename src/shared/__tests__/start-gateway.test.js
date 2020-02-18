// @flow
import * as UseAppEngineMiddleware from "../use-app-engine-middleware.js";
import {startGateway} from "../start-gateway.js";
import {createLogger} from "../create-logger.js";

describe("#start-gateway", () => {
    it("should add GAE middleware", () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            logger: createLogger("test", "debug"),
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        const useAppEngineMiddlewareSpy = jest
            .spyOn(UseAppEngineMiddleware, "useAppEngineMiddleware")
            .mockReturnValue(pretendApp);

        // Act
        startGateway(options, pretendApp);

        // Assert
        expect(useAppEngineMiddlewareSpy).toHaveBeenCalledWith(pretendApp);
    });

    it("should listen on the configured port", () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            logger: createLogger("test", "debug"),
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        jest.spyOn(
            UseAppEngineMiddleware,
            "useAppEngineMiddleware",
        ).mockReturnValue(pretendApp);

        // Act
        startGateway(options, pretendApp);

        // Assert
        expect(pretendApp.listen).toHaveBeenCalledWith(
            42,
            expect.any(Function),
        );
    });

    describe("listen callback", () => {
        it("should report start failure if gateway is null", () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                logger: createLogger("test", "debug"),
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(pretendApp);
            startGateway(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const listenCallback = listenMock.mock.calls[0][1];

            // Act
            listenCallback();

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "TEST_GATEWAY appears not to have started: Unknown error",
            );
        });

        it("should report start failure if there's an error", () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                logger: createLogger("test", "debug"),
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(pretendApp);
            startGateway(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const listenCallback = listenMock.mock.calls[0][1];

            // Act
            listenCallback(new Error("BOOM 🧨"));

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "TEST_GATEWAY appears not to have started: BOOM 🧨",
            );
        });

        it.each([[null, undefined, "ADDRESS"]])(
            "should report start failure if address is %s",
            (address) => {
                // Arrange
                const options = {
                    name: "TEST_GATEWAY",
                    port: 42,
                    logger: createLogger("test", "debug"),
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
                ).mockReturnValue(pretendApp);
                startGateway(options, pretendApp);
                const warnSpy = jest.spyOn(options.logger, "warn");
                const listenCallback = listenMock.mock.calls[0][1];

                // Act
                listenCallback();

                // Assert
                expect(warnSpy).toHaveBeenCalledWith(
                    `TEST_GATEWAY may not have started properly: ${address}`,
                );
            },
        );

        it("should report a successful start", () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                logger: createLogger("test", "debug"),
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
            ).mockReturnValue(pretendApp);
            startGateway(options, pretendApp);
            const infoSpy = jest.spyOn(options.logger, "info");
            const listenCallback = listenMock.mock.calls[0][1];

            // Act
            listenCallback();

            // Assert
            expect(infoSpy).toHaveBeenCalledWith(
                "TEST_GATEWAY running at http://ADDRESS:PORT",
            );
        });
    });
});
