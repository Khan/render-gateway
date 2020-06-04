// @flow
import * as JSDOM from "jsdom";

import * as Request from "../../../request.js";
import * as ApplyAbortablePromisesPatch from "../apply-abortable-promises-patch.js";
import * as Shared from "../../../../shared/index.js";

import {JSDOMSixteenResourceLoader} from "../jsdom-sixteen-resource-loader.js";

jest.mock("jsdom");
jest.mock("../../../../shared/index.js");
jest.mock("../../../request.js");
jest.mock("../apply-abortable-promises-patch.js");

describe("JSDOMSixteenResourceLoader", () => {
    describe("#constructor", () => {
        it("should invoke applyAbortablePromisesPatch before super()", () => {
            // Arrange
            const fakeRenderAPI: any = {};
            const applyAbortablePromisesPatchSpy = jest.spyOn(
                ApplyAbortablePromisesPatch,
                "applyAbortablePromisesPatch",
            );
            const resourceLoaderSpy = jest.spyOn(JSDOM, "ResourceLoader");

            // Act
            // eslint-disable-next-line no-new
            new JSDOMSixteenResourceLoader(fakeRenderAPI);

            // Assert
            expect(applyAbortablePromisesPatchSpy).toHaveBeenCalledBefore(
                resourceLoaderSpy,
            );
        });

        it("should throw if renderAPI is omitted", () => {
            // Arrange

            // Act
            const underTest = () => new JSDOMSixteenResourceLoader((null: any));

            // Assert
            expect(underTest).toThrowErrorMatchingInlineSnapshot(
                `"Must provide render API."`,
            );
        });

        it("should initialize isActive to true", () => {
            // Arrange
            const fakeRenderAPI: any = {};
            const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);

            // Act
            const result = underTest.isActive;

            // Assert
            expect(result).toBeTrue();
        });
    });

    describe("EMPTY_RESPONSE", () => {
        it("should resolve to empty buffer", async () => {
            // Arrange

            // Act
            const result = await JSDOMSixteenResourceLoader.EMPTY_RESPONSE;

            // Assert
            expect(result).toBeInstanceOf(Buffer);
            expect(result.toString()).toBeEmpty();
        });
    });

    describe("#close", () => {
        it("should abort inflight requests", () => {
            // Arrange
            const abortInFlightRequestsSpy = jest.spyOn(
                Request,
                "abortInFlightRequests",
            );
            const fakeRenderAPI: any = {};
            const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);

            // Act
            underTest.close();

            // Assert
            expect(abortInFlightRequestsSpy).toHaveBeenCalled();
        });

        it("should set isActive to false", () => {
            // Arrange
            const fakeRenderAPI: any = {};
            const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);

            // Act
            underTest.close();

            // Assert
            expect(underTest.isActive).toBeFalse();
        });

        it("should destroy agents it created", () => {
            // Arrange
            const fakePromise = {
                then: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Request, "request").mockReturnValue(fakePromise);
            const fakeLogger = "FAKE_LOGGER";
            const fakeRenderAPI: any = {
                logger: fakeLogger,
            };
            const fakeAgent = {
                destroy: jest.fn(),
            };
            jest.spyOn(Shared, "getAgentForURL").mockReturnValue(fakeAgent);
            const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);
            underTest.fetch("http://example.com/test.js?p=1");

            // Act
            underTest.close();

            // Assert
            expect(fakeAgent.destroy).toHaveBeenCalled();
        });
    });

    describe("#fetch", () => {
        describe("called before close()", () => {
            it("should return EMPTY_RESPONSE for non-JS file", () => {
                // Arrange
                const fakeRenderAPI: any = {
                    logger: {
                        silly: jest.fn(),
                    },
                };
                const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);

                // Act
                const result = underTest.fetch("http://example.com/test.png");

                // Assert
                expect(result).toStrictEqual(
                    JSDOMSixteenResourceLoader.EMPTY_RESPONSE,
                );
            });

            it("should not invoke request for non-JS file", () => {
                // Arrange
                const requestSpy = jest.spyOn(Request, "request");
                const fakeRenderAPI: any = {
                    logger: {
                        silly: jest.fn(),
                    },
                };
                const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);

                // Act
                underTest.fetch("http://example.com/test.png");

                // Assert
                expect(requestSpy).not.toHaveBeenCalled();
            });

            it("should invoke request for JS file", () => {
                // Arrange
                const fakePromise = {
                    then: jest.fn().mockReturnThis(),
                };
                const requestSpy = jest
                    .spyOn(Request, "request")
                    .mockReturnValue(fakePromise);
                const fakeLogger = "FAKE_LOGGER";
                const fakeRenderAPI: any = {
                    logger: fakeLogger,
                };
                const fakeAgent = {
                    destroy: jest.fn(),
                };
                jest.spyOn(Shared, "getAgentForURL").mockReturnValue(fakeAgent);
                const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);

                // Act
                underTest.fetch("http://example.com/test.js?p=1");

                // Assert
                expect(requestSpy).toHaveBeenCalledWith(
                    "FAKE_LOGGER",
                    "http://example.com/test.js?p=1",
                    expect.objectContaining({
                        agent: fakeAgent,
                        ...Request.DefaultRequestOptions,
                    }),
                );
            });

            it("should have abort function that invokes abort on request", () => {
                // Arrange
                const fakePromise = {
                    then: jest.fn().mockReturnThis(),
                    abort: jest.fn(),
                };
                jest.spyOn(Request, "request").mockReturnValue(fakePromise);
                const fakeLogger = "FAKE_LOGGER";
                const fakeRenderAPI: any = {
                    logger: fakeLogger,
                };
                const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);

                // Act
                const result: any = underTest.fetch(
                    "http://example.com/test.js?p=1",
                );
                result.abort();

                // Assert
                expect(fakePromise.abort).toHaveBeenCalled();
            });

            it("should resolve with buffer of content", async () => {
                // Arrange
                const fakeResponse = {
                    text: "RESPONSE",
                };
                jest.spyOn(Request, "request").mockReturnValue(
                    Promise.resolve(fakeResponse),
                );
                const fakeLogger = "FAKE_LOGGER";
                const fakeRenderAPI: any = {
                    logger: fakeLogger,
                };
                const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);

                // Act
                const result: any = await underTest.fetch(
                    "http://example.com/test.js?p=1",
                );

                // Assert
                expect(result).toBeInstanceOf(Buffer);
                expect(result.toString()).toBe("RESPONSE");
            });

            describe("fetch resolves after close()", () => {
                it("should resolve to an empty buffer", async () => {
                    // Arrange
                    const fakeResponse = {
                        text: "RESPONSE",
                    };
                    jest.spyOn(Request, "request").mockReturnValue(
                        Promise.resolve(fakeResponse),
                    );
                    const fakeLogger = {
                        silly: jest.fn(),
                    };
                    const fakeRenderAPI: any = {
                        logger: fakeLogger,
                    };
                    const fakeAgent = {
                        destroy: jest.fn(),
                    };
                    jest.spyOn(Shared, "getAgentForURL").mockReturnValue(
                        fakeAgent,
                    );
                    const underTest = new JSDOMSixteenResourceLoader(
                        fakeRenderAPI,
                    );

                    // Act
                    const response: any = underTest.fetch(
                        "http://example.com/test.js?p=1",
                    );
                    underTest.close();
                    const result = await response;

                    // Assert
                    expect(result).toBeInstanceOf(Buffer);
                    expect(result.toString()).toBe("");
                });

                it("should log silly", async () => {
                    // Arrange
                    const fakeResponse = {
                        text: "RESPONSE",
                    };
                    jest.spyOn(Request, "request").mockReturnValue(
                        Promise.resolve(fakeResponse),
                    );
                    const fakeLogger = {
                        silly: jest.fn(),
                    };
                    const fakeRenderAPI: any = {
                        logger: fakeLogger,
                    };
                    const fakeAgent = {
                        destroy: jest.fn(),
                    };
                    jest.spyOn(Shared, "getAgentForURL").mockReturnValue(
                        fakeAgent,
                    );
                    const underTest = new JSDOMSixteenResourceLoader(
                        fakeRenderAPI,
                    );

                    // Act
                    const response: any = underTest.fetch(
                        "http://example.com/test.js?p=1",
                    );
                    underTest.close();
                    await response;

                    // Assert
                    expect(fakeLogger.silly).toHaveBeenCalledWith(
                        "File requested but never used: http://example.com/test.js?p=1",
                    );
                });
            });
        });

        describe("called after close()", () => {
            it("should log a warning", () => {
                // Arrange
                const fakeRenderAPI: any = {
                    logger: {
                        warn: jest.fn(),
                    },
                };
                const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);
                underTest.close();

                // Act
                underTest.fetch("http://example.com/test.js");

                // Assert
                expect(fakeRenderAPI.logger.warn).toHaveBeenCalledWith(
                    "File fetch attempted after resource loader close: http://example.com/test.js",
                );
            });

            it("should not log a warning for inline data", () => {
                // Arrange
                const fakeRenderAPI: any = {
                    logger: {
                        warn: jest.fn(),
                    },
                };
                const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);
                underTest.close();

                // Act
                underTest.fetch("data:inline datary things like an SVG");

                // Assert
                expect(fakeRenderAPI.logger.warn).not.toHaveBeenCalled();
            });

            it("should return EMPTY_RESPONSE", () => {
                // Arrange
                const fakeRenderAPI: any = {
                    logger: {
                        warn: jest.fn(),
                    },
                };
                const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);
                underTest.close();

                // Act
                const result = underTest.fetch("http://example.com/test.js");

                // Assert
                expect(result).toStrictEqual(
                    JSDOMSixteenResourceLoader.EMPTY_RESPONSE,
                );
            });
        });
    });
});
