// @flow
import * as Express from "express";
import * as ExpressAsyncHandler from "express-async-handler";
import * as KAShared from "../../ka-shared/index.js";
import * as Shared from "../../shared/index.js";
import * as MakeRenderHandler from "../handlers/make-render-handler.js";
import * as MakeCheckSecretMiddleware from "../middleware/make-check-secret-middleware.js";
import * as LogRequestInfoMiddleware from "../middleware/log-request-info-middleware.js";

import {runServer} from "../run-server.js";

jest.mock("express");
jest.mock("express-async-handler");
jest.mock("../../ka-shared/index.js");
jest.mock("../../shared/index.js");
jest.mock("../handlers/make-render-handler.js");
jest.mock("../middleware/make-check-secret-middleware.js");
jest.mock("../middleware/log-request-info-middleware.js");

describe("#runServer", () => {
    it("should create an express app", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const fakeRenderEnvironment: any = {
            render: jest.fn(),
        };
        jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(Shared, "getGatewayInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
            set: jest.fn(),
        }: any);
        const expressSpy = jest
            .spyOn(Express, "default")
            .mockReturnValue(pretendApp);

        // Act
        await runServer({
            name: "MY_TEST",
            port: 42,
            renderEnvironment: fakeRenderEnvironment,
        });

        // Assert
        expect(expressSpy).toHaveBeenCalledTimes(1);
    });

    it("should setup the common service routes", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const fakeRenderEnvironment: any = {
            render: jest.fn(),
        };
        jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(Shared, "getGatewayInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
            set: jest.fn(),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        const pretendCommonServiceRouter = ({}: any);
        jest.spyOn(KAShared, "makeCommonServiceRouter").mockReturnValue(
            pretendCommonServiceRouter,
        );

        // Act
        await runServer({
            name: "MY_TEST",
            port: 42,
            renderEnvironment: fakeRenderEnvironment,
        });

        // Assert
        expect(pretendApp.use).toHaveBeenCalledWith(pretendCommonServiceRouter);
    });

    it("should add check secret middleware", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const fakeRenderEnvironment: any = {
            render: jest.fn(),
        };
        const pretendAuthOptions = ({}: any);
        jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(Shared, "getGatewayInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
            set: jest.fn(),
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
            renderEnvironment: fakeRenderEnvironment,
            authentication: pretendAuthOptions,
        });

        // Assert
        expect(makeCheckSecretMiddlewareSpy).toHaveBeenCalledWith(
            pretendAuthOptions,
        );
    });

    it("should add log request info middleware after secret middleware", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const fakeRenderEnvironment: any = {
            render: jest.fn(),
        };
        const pretendAuthOptions = ({}: any);
        jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(Shared, "getGatewayInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
            set: jest.fn(),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        const logRequestInfoMiddlewareSpy = jest.spyOn(
            LogRequestInfoMiddleware,
            "logRequestInfoMiddleware",
        );

        // Act
        await runServer({
            name: "MY_TEST",
            port: 42,
            renderEnvironment: fakeRenderEnvironment,
            authentication: pretendAuthOptions,
        });

        // Assert
        expect(pretendApp.use).toHaveBeenLastCalledWith(
            logRequestInfoMiddlewareSpy,
        );
    });

    it("should add the render handler wrapped by express-async-handler", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const fakeRenderEnvironment: any = {
            render: jest.fn(),
        };
        jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(Shared, "getGatewayInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
            set: jest.fn(),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);

        /**
         * To check that the render handler is what gets wrapped, we're going
         * to mock one to just be a function that returns a string, and then
         * mock the wrapper to return a version of that string. Then we can
         * confirm that they were combined for our test expectation.
         */
        jest.spyOn(MakeRenderHandler, "makeRenderHandler").mockReturnValue(
            () => "RENDER_HANDLER",
        );
        jest.spyOn(ExpressAsyncHandler, "default").mockImplementation(
            (pretendFn) => `ASYNC_HANDLER:${pretendFn()}`,
        );

        // Act
        await runServer({
            name: "MY_TEST",
            port: 42,
            renderEnvironment: fakeRenderEnvironment,
        });

        // Assert
        expect(pretendApp.get).toHaveBeenCalledWith(
            "/_render",
            "ASYNC_HANDLER:RENDER_HANDLER",
        );
    });

    it("should start the gateway", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const fakeRenderEnvironment: any = {render: jest.fn()};
        jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(Shared, "getGatewayInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
            set: jest.fn(),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        const startGatewaySpy = jest.spyOn(Shared, "startGateway");

        // Act
        await runServer({
            name: "MY_TEST",
            port: 42,
            renderEnvironment: fakeRenderEnvironment,
        });

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
