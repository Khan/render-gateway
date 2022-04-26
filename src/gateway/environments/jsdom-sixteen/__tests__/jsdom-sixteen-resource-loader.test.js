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
            expect(underTest).toThrowErrorMatchingInlineSnapshot(`""`);
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
                };
                const fakeRequest = {
                    then: jest.fn().mockReturnValue(fakePromise),
                    abort: jest.fn(),
                    aborted: "FAKE_ABORTED_VALUE",
                };
                jest.spyOn(Request, "request").mockReturnValue(fakeRequest);
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
                expect(fakeRequest.abort).toHaveBeenCalled();
            });

            it("should have aborted property that gets aborted property of request", () => {
                // Arrange
                const fakePromise = {
                    then: jest.fn().mockReturnThis(),
                };
                const fakeRequest = {
                    then: jest.fn().mockReturnValue(fakePromise),
                    abort: jest.fn(),
                    aborted: "FAKE_ABORTED_VALUE",
                };
                jest.spyOn(Request, "request").mockReturnValue(fakeRequest);
                const fakeLogger = "FAKE_LOGGER";
                const fakeRenderAPI: any = {
                    logger: fakeLogger,
                };
                const underTest = new JSDOMSixteenResourceLoader(fakeRenderAPI);

                // Act
                const result: any = underTest.fetch(
                    "http://example.com/test.js?p=1",
                );

                // Assert
                expect(result.aborted).toBe(fakeRequest.aborted);
            });

            it("should resolve with buffer of content", async () => {
                // Arrange
                const fakeResponse = {
                    text: "RESPONSE",
                };
                jest.spyOn(Request, "request").mockResolvedValue(fakeResponse);
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

            it("should invoke custom handler if one was provided", async () => {
                // Arrange
                const fakeResponse = Promise.resolve({
                    text: "RESPONSE",
                });
                jest.spyOn(Request, "request").mockReturnValue(fakeResponse);
                const fakeLogger = "FAKE_LOGGER";
                const fakeRenderAPI: any = {
                    logger: fakeLogger,
                };
                const fakeFetchOptions = {
                    options: "ARE FAKE",
                };
                const customHandler = jest
                    .fn()
                    .mockResolvedValue(Buffer.from("CUSTOM"));
                const underTest = new JSDOMSixteenResourceLoader(
                    fakeRenderAPI,
                    undefined,
                    customHandler,
                );

                // Act
                await underTest.fetch(
                    "http://example.com/test.js?p=1",
                    fakeFetchOptions,
                );

                // Assert
                expect(customHandler).toHaveBeenCalledWith(
                    fakeResponse,
                    "http://example.com/test.js?p=1",
                    fakeFetchOptions,
                );
            });

            it("should return result of custom handler if one was provided", async () => {
                // Arrange
                const fakeResponse = Promise.resolve({
                    text: "RESPONSE",
                });
                jest.spyOn(Request, "request").mockReturnValue(fakeResponse);
                const fakeLogger = "FAKE_LOGGER";
                const fakeRenderAPI: any = {
                    logger: fakeLogger,
                };
                const fakeFetchOptions = {
                    options: "ARE FAKE",
                };
                const customHandler = jest
                    .fn()
                    .mockResolvedValue(Buffer.from("CUSTOM"));
                const underTest = new JSDOMSixteenResourceLoader(
                    fakeRenderAPI,
                    undefined,
                    customHandler,
                );

                // Act
                const result: any = await underTest.fetch(
                    "http://example.com/test.js?p=1",
                    fakeFetchOptions,
                );

                // Assert
                expect(result.toString()).toBe("CUSTOM");
            });

            describe("but resolves after close()", () => {
                it("should resolve to an empty buffer", async () => {
                    // Arrange
                    const fakeResponse = {
                        text: "RESPONSE",
                    };
                    jest.spyOn(Request, "request").mockReturnValue(
                        Promise.resolve(fakeResponse),
                    );
                    const fakeLogger = {
                        info: jest.fn(),
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

                it("should log info", async () => {
                    // Arrange
                    const fakeResponse = {
                        text: "RESPONSE",
                    };
                    jest.spyOn(Request, "request").mockReturnValue(
                        Promise.resolve(fakeResponse),
                    );
                    const fakeLogger = {
                        info: jest.fn(),
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
                    expect(fakeLogger.info).toHaveBeenCalledWith(
                        "File requested but never used: http://example.com/test.js?p=1",
                    );
                });
            });
        });

        it("should resolve to empty response for aborted requests", async () => {
            // Arrange
            const abortablePromise = new Promise((resolve, reject) => {
                resolve({text: "THIS IS NOT EMPTY"});
            });
            (abortablePromise: any).abort = jest.fn();
            (abortablePromise: any).aborted = true;
            jest.spyOn(Request, "request").mockReturnValue(abortablePromise);
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
            expect(result).toBeEmpty();
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
