// @flow
import * as Express from "express";
import {makeCommonServiceRouter} from "../make-common-service-router.js";

jest.mock("express");

describe("#makeCommonServiceRouter", () => {
    describe("route /_api/ping", () => {
        it("should be defined", () => {
            // Arrange
            const mockRouter = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);

            // Act
            makeCommonServiceRouter("THE_VERSION");

            // Assert
            expect(mockRouter.get).toHaveBeenCalledWith(
                "/_api/ping",
                expect.any(Function),
            );
        });

        it("should send pong", () => {
            // Arrange
            const fakeRequest = {};
            const fakeResponse = {
                send: jest.fn(),
            };
            const mockRouter = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);
            const getSpy = jest.spyOn(mockRouter, "get");
            makeCommonServiceRouter("THE_VERSION");
            const routeArgs =
                getSpy.mock.calls.find((c) => c[0] === "/_api/ping") || [];
            const routeHandler = routeArgs[1];

            // Act
            routeHandler(fakeRequest, fakeResponse);

            // Assert
            expect(fakeResponse.send).toHaveBeenCalledWith("pong\n");
        });
    });

    describe("route /_ah/warmup", () => {
        it("should be defined", () => {
            // Arrange
            const mockRouter = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);

            // Act
            makeCommonServiceRouter("THE_VERSION");

            // Assert
            expect(mockRouter.get).toHaveBeenCalledWith(
                "/_ah/warmup",
                expect.any(Function),
            );
        });

        it("should send OK", () => {
            // Arrange
            const fakeRequest = {};
            const fakeResponse = {
                send: jest.fn(),
            };
            const mockRouter = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);
            const getSpy = jest.spyOn(mockRouter, "get");
            makeCommonServiceRouter("THE_VERSION");
            const routeArgs =
                getSpy.mock.calls.find((c) => c[0] === "/_ah/warmup") || [];
            const routeHandler = routeArgs[1];

            // Act
            routeHandler(fakeRequest, fakeResponse);

            // Assert
            expect(fakeResponse.send).toHaveBeenCalledWith("OK\n");
        });
    });

    describe("route /_api/version", () => {
        it("should be defined", () => {
            // Arrange
            const mockRouter = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);

            // Act
            makeCommonServiceRouter("THE_VERSION");

            // Assert
            expect(mockRouter.get).toHaveBeenCalledWith(
                "/_api/version",
                expect.any(Function),
            );
        });

        it("should send given version", () => {
            // Arrange
            const fakeRequest = {};
            const fakeResponse = {
                send: jest.fn(),
            };
            const mockRouter = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);
            const getSpy = jest.spyOn(mockRouter, "get");
            makeCommonServiceRouter("THE_VERSION");
            const routeArgs =
                getSpy.mock.calls.find((c) => c[0] === "/_api/version") || [];
            const routeHandler = routeArgs[1];

            // Act
            routeHandler(fakeRequest, fakeResponse);

            // Assert
            expect(fakeResponse.send).toHaveBeenCalledWith({
                version: "THE_VERSION",
            });
        });
    });
});
