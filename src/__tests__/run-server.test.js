// @flow
import * as Express from "express";
import * as ExpressAsyncHandler from "express-async-handler";
import * as WSServer from "@khanacademy/wonder-stuff-server";
import * as MakeRenderHandler from "../handlers/make-render-handler.js";

import {runServer} from "../run-server.js";

jest.mock("express");
jest.mock("express-async-handler");
jest.mock("@khanacademy/wonder-stuff-server");
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
        jest.spyOn(WSServer, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(WSServer, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({});
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
            host: "127.0.0.1",
            renderEnvironment: fakeRenderEnvironment,
            authentication: {
                cryptoKeyPath: "IGNORED",
                headerName: "IGNORED",
                secretKey: "IGNORED",
            },
        });

        // Assert
        expect(expressSpy).toHaveBeenCalledTimes(1);
    });

    it("should add the render handler wrapped by express-async-handler", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const fakeRenderEnvironment: any = {
            render: jest.fn(),
        };
        jest.spyOn(WSServer, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(WSServer, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({});
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
            host: "127.0.0.1",
            renderEnvironment: fakeRenderEnvironment,
            authentication: {
                cryptoKeyPath: "IGNORED",
                headerName: "IGNORED",
                secretKey: "IGNORED",
            },
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
        jest.spyOn(WSServer, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(WSServer, "createLogger").mockReturnValue(pretendLogger);
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({});
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
            set: jest.fn(),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        const startGatewaySpy = jest.spyOn(WSServer, "startServer");

        // Act
        await runServer({
            name: "MY_TEST",
            port: 42,
            host: "127.0.0.1",
            renderEnvironment: fakeRenderEnvironment,
            authentication: {
                cryptoKeyPath: "IGNORED",
                headerName: "IGNORED",
                secretKey: "IGNORED",
            },
        });

        // Assert
        expect(startGatewaySpy).toHaveBeenCalledWith(
            {
                name: "MY_TEST",
                port: 42,
                host: "127.0.0.1",
                logger: pretendLogger,
                mode: "test",
            },
            pretendApp,
        );
    });
});
