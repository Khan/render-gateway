// @flow
import * as Express from "express";
import * as ExpressAsyncHandler from "express-async-handler";
import * as KAShared from "../ka-shared/index.js";
import * as GetRuntimeMode from "../ka-shared/get-runtime-mode.js";
import * as Shared from "../shared/index.js";
import * as RenderHandler from "../handlers/render-handler.js";
import * as MakeCheckSecretMiddleware from "../middleware/make-check-secret-middleware.js";

import {runServer} from "../run-server.js";

jest.mock("express");
jest.mock("express-async-handler");
jest.mock("../ka-shared/get-runtime-mode.js");
jest.mock("../ka-shared/index.js");
jest.mock("../shared/index.js");
jest.mock("../handlers/render-handler.js");
jest.mock("../middleware/make-check-secret-middleware.js");

// TODO: Test render stuff by wrapping with express-async-handler

describe("#runServer", () => {
    it("should create an express app", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(Shared, "getGatewayInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
        }: any);
        const expressSpy = jest
            .spyOn(Express, "default")
            .mockReturnValue(pretendApp);

        // Act
        await runServer({name: "MY_TEST", port: 42, renderFn: jest.fn()});

        // Assert
        expect(expressSpy).toHaveBeenCalledTimes(1);
    });

    it("should setup the common service routes", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(Shared, "getGatewayInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        const pretendCommonServiceRouter = ({}: any);
        jest.spyOn(KAShared, "makeCommonServiceRouter").mockReturnValue(
            pretendCommonServiceRouter,
        );

        // Act
        await runServer({name: "MY_TEST", port: 42, renderFn: jest.fn()});

        // Assert
        expect(pretendApp.use).toHaveBeenCalledWith(pretendCommonServiceRouter);
    });

    it("should add check secret middleware", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendAuthOptions = ({}: any);
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(Shared, "getGatewayInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        const makeCheckSecretMiddlewareSpy = jest.spyOn(
            MakeCheckSecretMiddleware,
            "makeCheckSecretMiddleware",
        );

        // Act
        await runServer({
            name: "MY_TEST",
            port: 42,
            authentication: pretendAuthOptions,
            renderFn: jest.fn(),
        });

        // Assert
        expect(makeCheckSecretMiddlewareSpy).toHaveBeenCalledWith(
            pretendAuthOptions,
        );
    });

    it("should add the render handler wrapped by express-async-handler", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(Shared, "getGatewayInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);

        /**
         * To check that the render handler is what is wrapped, we're going
         * to mock it to just be a function that returns a string, and then
         * mock the wrapper to return a version of that string. Then we can
         * confirm that they were combined for our test expectation.
         */
        jest.spyOn(RenderHandler, "renderHandler").mockReturnValue(
            "RENDER_HANDLER",
        );
        jest.spyOn(ExpressAsyncHandler, "default").mockImplementation(
            (pretendFn) => `ASYNC_HANDLER:${pretendFn()}`,
        );

        // Act
        await runServer({name: "MY_TEST", port: 42, renderFn: jest.fn()});

        // Assert
        expect(pretendApp.get).toHaveBeenCalledWith(
            "/*",
            "ASYNC_HANDLER:RENDER_HANDLER",
        );
    });

    it("should start the gateway", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(Shared, "getGatewayInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        const startGatewaySpy = jest.spyOn(Shared, "startGateway");

        // Act
        await runServer({name: "MY_TEST", port: 42, renderFn: jest.fn()});

        // Assert
        expect(startGatewaySpy).toHaveBeenCalledWith(
            {
                name: "MY_TEST",
                port: 42,
                logger: pretendLogger,
                mode: "test",
            },
            pretendApp,
        );
    });
});
