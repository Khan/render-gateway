// @flow
import * as Express from "express";
import {runServer} from "../run-server.js";

import * as GetRuntimeMode from "../ka-shared/get-runtime-mode.js";
import * as Shared from "../shared/index.js";
import * as KAShared from "../ka-shared/index.js";
import * as MakeCheckSecretMiddleware from "../middleware/make-check-secret-middleware.js";

jest.mock("express");
jest.mock("../ka-shared/get-runtime-mode.js");
jest.mock("../ka-shared/index.js");
jest.mock("../shared/index.js");
jest.mock("../middleware/make-check-secret-middleware.js");

describe("#runServer", () => {
    it("should create an express app", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
        }: any);
        const expressSpy = jest
            .spyOn(Express, "default")
            .mockReturnValue(pretendApp);

        // Act
        await runServer({name: "MY_TEST", port: 42});

        // Assert
        expect(expressSpy).toHaveBeenCalledTimes(1);
    });

    it("should setup the common service routes", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
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
        await runServer({name: "MY_TEST", port: 42});

        // Assert
        expect(pretendApp.use).toHaveBeenCalledWith(pretendCommonServiceRouter);
    });

    it("should add check secret middleware", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        const pretendAuthOptions = ({}: any);
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
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
        });

        // Assert
        expect(makeCheckSecretMiddlewareSpy).toHaveBeenCalledWith(
            pretendAuthOptions,
        );
    });

    it("should start the gateway", async () => {
        // Arrange
        const pretendLogger = ({}: any);
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue("test");
        jest.spyOn(KAShared, "getLogger").mockReturnValue(pretendLogger);
        const pretendApp = ({
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
        }: any);
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        const startGatewaySpy = jest.spyOn(Shared, "startGateway");

        // Act
        await runServer({name: "MY_TEST", port: 42});

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
