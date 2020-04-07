// @flow
import * as Shared from "../../../shared/index.js";
import * as KAShared from "../../../ka-shared/index.js";
import {makeRenderHandler} from "../make-render-handler.js";

jest.mock("../../../shared/index.js");
jest.mock("../../../ka-shared/index.js");

describe("#makeRenderHandler", () => {
    it("should return a function", () => {
        // Arrange
        const fakeRenderEnvironment: any = {
            render: jest.fn(),
        };

        // Act
        const result = makeRenderHandler(fakeRenderEnvironment);

        // Assert
        expect(result).toBeFunction();
    });

    describe("returned handler", () => {
        it("should get a logger from the request", async () => {
            // Arrange
            const fakeResponse: any = {
                send: jest.fn().mockReturnThis(),
                status: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {
                    url: "THE_URL",
                },
            };
            const renderResult = {
                body: "BODY",
                status: 200,
                headers: {},
            };
            const fakeRenderEnvironment: any = {
                render: jest
                    .fn()
                    .mockReturnValue(Promise.resolve(renderResult)),
            };
            jest.spyOn(KAShared, "trace").mockReturnValue({
                end: jest.fn(),
                addLabel: jest.fn(),
            });
            const getLoggerSpy = jest.spyOn(KAShared, "getLogger");
            const handler = makeRenderHandler(fakeRenderEnvironment);

            // Act
            /**
             * Middleware<Request, Response> can mean two different call
             * signatures, and sadly, they both have completely different
             * argument type ordering, which totally confused flow here.
             * $FlowIgnore
             */
            await handler(fakeRequest, fakeResponse);

            // Assert
            expect(getLoggerSpy).toHaveBeenCalledWith(fakeRequest);
        });

        it("should throw if the request url param is missing", async () => {
            // Arrange
            const fakeResponse: any = {
                send: jest.fn().mockReturnThis(),
                status: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {},
            };
            const renderResult = {
                body: "BODY",
                status: 200,
                headers: {},
            };
            jest.spyOn(KAShared, "trace").mockReturnValue({
                end: jest.fn(),
                addLabel: jest.fn(),
            });
            const fakeRenderEnvironment: any = {
                render: jest
                    .fn()
                    .mockReturnValue(Promise.resolve(renderResult)),
            };
            const handler = makeRenderHandler(fakeRenderEnvironment);

            // Act
            /**
             * Middleware<Request, Response> can mean two different call
             * signatures, and sadly, they both have completely different
             * argument type ordering, which totally confused flow here.
             * $FlowIgnore
             */
            const underTest = handler(fakeRequest, fakeResponse);

            // Assert
            expect(underTest).rejects.toThrowErrorMatchingInlineSnapshot(
                `"Missing url query param"`,
            );
        });

        it("should throw if there are multiple url params", async () => {
            // Arrange
            const fakeResponse: any = {
                send: jest.fn().mockReturnThis(),
                status: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {
                    url: ["URL1", "URL2"],
                },
            };
            const renderResult = {
                body: "BODY",
                status: 200,
                headers: {},
            };
            jest.spyOn(KAShared, "trace").mockReturnValue({
                end: jest.fn(),
                addLabel: jest.fn(),
            });
            const fakeRenderEnvironment: any = {
                render: jest
                    .fn()
                    .mockReturnValue(Promise.resolve(renderResult)),
            };
            const handler = makeRenderHandler(fakeRenderEnvironment);

            // Act
            /**
             * Middleware<Request, Response> can mean two different call
             * signatures, and sadly, they both have completely different
             * argument type ordering, which totally confused flow here.
             * $FlowIgnore
             */
            const underTest = handler(fakeRequest, fakeResponse);

            // Assert
            expect(underTest).rejects.toThrowErrorMatchingInlineSnapshot(
                `"More than one url query param given"`,
            );
        });

        it("should invoke given render function with url and API", async () => {
            // Arrange
            const fakeResponse: any = {
                send: jest.fn().mockReturnThis(),
                status: jest.fn().mockReturnThis(),
            };
            const fakeRequest: any = {
                query: {
                    url: "THE_URL",
                },
            };
            jest.spyOn(KAShared, "trace").mockReturnValue({
                end: jest.fn(),
                addLabel: jest.fn(),
            });
            const fakeLogger = "FAKE_LOGGER";
            jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);
            const renderResult = {
                body: "BODY",
                status: 200,
                headers: {},
            };
            const fakeRenderEnvironment: any = {
                render: jest
                    .fn()
                    .mockReturnValue(Promise.resolve(renderResult)),
            };
            const handler = makeRenderHandler(fakeRenderEnvironment);

            // Act
            /**
             * Middleware<Request, Response> can mean two different call
             * signatures, and sadly, they both have completely different
             * argument type ordering, which totally confused flow here.
             * $FlowIgnore
             */
            await handler(fakeRequest, fakeResponse);

            // Assert
            expect(fakeRenderEnvironment.render).toHaveBeenCalledWith(
                "THE_URL",
                {
                    logger: fakeLogger,
                    getHeader: expect.any(Function),
                    trace: expect.any(Function),
                },
            );
        });

        describe("provided render API", () => {
            describe("#getHeader", () => {
                it("should return the value of the requested header", async () => {
                    // Arrange
                    const fakeResponse: any = {
                        send: jest.fn().mockReturnThis(),
                        status: jest.fn().mockReturnThis(),
                    };
                    const fakeRequest: any = {
                        query: {
                            url: "THE_URL",
                        },
                        header: jest.fn().mockReturnValue("HEADER_VALUE"),
                    };
                    const renderResult = {
                        body: "BODY",
                        status: 200,
                        headers: {},
                    };
                    jest.spyOn(KAShared, "trace").mockReturnValue({
                        end: jest.fn(),
                        addLabel: jest.fn(),
                    });
                    const fakeRenderEnvironment: any = {
                        render: jest
                            .fn()
                            .mockReturnValue(Promise.resolve(renderResult)),
                    };
                    const handler = makeRenderHandler(fakeRenderEnvironment);
                    /**
                     * Middleware<Request, Response> can mean two different call
                     * signatures, and sadly, they both have completely different
                     * argument type ordering, which totally confused flow here.
                     * $FlowIgnore
                     */
                    await handler(fakeRequest, fakeResponse);
                    const underTest =
                        fakeRenderEnvironment.render.mock.calls[0][1].getHeader;

                    // Act
                    const result = underTest("HEADER_NAME");

                    //Assert
                    expect(result).toBe("HEADER_VALUE");
                    expect(fakeRequest.header).toHaveBeenCalledWith(
                        "HEADER_NAME",
                    );
                });
            });

            describe("#trace", () => {
                it("should call trace", async () => {
                    // Arrange
                    const fakeResponse: any = {
                        send: jest.fn().mockReturnThis(),
                        status: jest.fn().mockReturnThis(),
                    };
                    const fakeRequest: any = {
                        query: {
                            url: "THE_URL",
                        },
                    };
                    const renderResult = {
                        body: "BODY",
                        status: 200,
                        headers: {},
                    };
                    const fakeRenderEnvironment: any = {
                        render: jest
                            .fn()
                            .mockReturnValue(Promise.resolve(renderResult)),
                    };
                    const traceSpy = jest
                        .spyOn(KAShared, "trace")
                        .mockReturnValue({
                            end: jest.fn(),
                            addLabel: jest.fn(),
                        });
                    const handler = makeRenderHandler(fakeRenderEnvironment);
                    /**
                     * Middleware<Request, Response> can mean two different call
                     * signatures, and sadly, they both have completely different
                     * argument type ordering, which totally confused flow here.
                     * $FlowIgnore
                     */
                    await handler(fakeRequest, fakeResponse);
                    const underTest =
                        fakeRenderEnvironment.render.mock.calls[0][1].trace;

                    // Act
                    underTest("TRACE_ACTION", "MESSAGE");

                    //Assert
                    expect(traceSpy).toHaveBeenCalledWith(
                        "TRACE_ACTION",
                        "MESSAGE",
                        fakeRequest,
                    );
                });
            });
        });

        describe("when render callback resolves", () => {
            it.todo("should attach the headers to the response");
            it.todo("should validate the status and headers");
            it.todo("should response with 500 error if validation fails");
            it.todo("should build Vary header from tracked header accesses");

            it("should set status of response from render result", async () => {
                // Arrange
                const fakeResponse: any = {
                    send: jest.fn().mockReturnThis(),
                    status: jest.fn().mockReturnThis(),
                };
                const fakeRequest: any = {
                    query: {
                        url: "THE_URL",
                    },
                };
                const renderResult = {
                    body: "BODY",
                    status: 200,
                    headers: {},
                };
                jest.spyOn(KAShared, "trace").mockReturnValue({
                    end: jest.fn(),
                    addLabel: jest.fn(),
                });
                const fakeRenderEnvironment: any = {
                    render: jest
                        .fn()
                        .mockReturnValue(Promise.resolve(renderResult)),
                };
                const handler = makeRenderHandler(fakeRenderEnvironment);

                // Act
                /**
                 * Middleware<Request, Response> can mean two different call
                 * signatures, and sadly, they both have completely different
                 * argument type ordering, which totally confused flow here.
                 * $FlowIgnore
                 */
                await handler(fakeRequest, fakeResponse);

                // Assert
                expect(fakeResponse.status).toHaveBeenCalledWith(200);
            });

            it("should send the render result body", async () => {
                // Arrange
                const fakeResponse: any = {
                    send: jest.fn().mockReturnThis(),
                    status: jest.fn().mockReturnThis(),
                };
                const fakeRequest: any = {
                    query: {
                        url: "THE_URL",
                    },
                };
                const renderResult = {
                    body: "BODY",
                    status: 200,
                    headers: {},
                };
                jest.spyOn(KAShared, "trace").mockReturnValue({
                    end: jest.fn(),
                    addLabel: jest.fn(),
                });
                const fakeRenderEnvironment: any = {
                    render: jest
                        .fn()
                        .mockReturnValue(Promise.resolve(renderResult)),
                };
                const handler = makeRenderHandler(fakeRenderEnvironment);

                // Act
                /**
                 * Middleware<Request, Response> can mean two different call
                 * signatures, and sadly, they both have completely different
                 * argument type ordering, which totally confused flow here.
                 * $FlowIgnore
                 */
                await handler(fakeRequest, fakeResponse);

                // Assert
                expect(fakeResponse.send).toHaveBeenCalledWith("BODY");
            });
        });

        describe("when the render callback rejects", () => {
            it("should use extractError to get a simplified error from rejection error", async () => {
                // Arrange
                const fakeResponse: any = {
                    json: jest.fn().mockReturnThis(),
                    status: jest.fn().mockReturnThis(),
                };
                const fakeRequest: any = {
                    query: {
                        url: "THE_URL",
                    },
                };
                jest.spyOn(KAShared, "trace").mockReturnValue({
                    end: jest.fn(),
                    addLabel: jest.fn(),
                });
                const fakeRenderEnvironment: any = {
                    render: jest.fn().mockReturnValue(Promise.reject("ERROR!")),
                };
                const fakeLogger = {
                    error: jest.fn(),
                };
                jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);
                const handler = makeRenderHandler(fakeRenderEnvironment);
                const extractErrorSpy = jest.spyOn(Shared, "extractError");

                // Act
                /**
                 * Middleware<Request, Response> can mean two different call
                 * signatures, and sadly, they both have completely different
                 * argument type ordering, which totally confused flow here.
                 * $FlowIgnore
                 */
                await handler(fakeRequest, fakeResponse);

                // Assert
                expect(extractErrorSpy).toHaveBeenCalledWith("ERROR!");
            });

            it("should log an error including metadata for error and rendered URL", async () => {
                // Arrange
                const fakeResponse: any = {
                    json: jest.fn().mockReturnThis(),
                    status: jest.fn().mockReturnThis(),
                };
                const fakeRequest: any = {
                    query: {
                        url: "THE_URL",
                    },
                };
                jest.spyOn(KAShared, "trace").mockReturnValue({
                    end: jest.fn(),
                    addLabel: jest.fn(),
                });
                const fakeRenderEnvironment: any = {
                    render: jest.fn().mockReturnValue(Promise.reject()),
                };
                const simplifiedError = {
                    error: "EXTRACTED_ERROR",
                };
                jest.spyOn(Shared, "extractError").mockReturnValue(
                    simplifiedError,
                );
                const fakeLogger = {
                    error: jest.fn(),
                };
                jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);
                const handler = makeRenderHandler(fakeRenderEnvironment);

                // Act
                /**
                 * Middleware<Request, Response> can mean two different call
                 * signatures, and sadly, they both have completely different
                 * argument type ordering, which totally confused flow here.
                 * $FlowIgnore
                 */
                await handler(fakeRequest, fakeResponse);

                // Assert
                expect(fakeLogger.error).toHaveBeenCalledWith("Render failed", {
                    ...simplifiedError,
                    renderURL: "THE_URL",
                });
            });

            it("should set the response status to 500", async () => {
                // Arrange
                const fakeResponse: any = {
                    json: jest.fn().mockReturnThis(),
                    status: jest.fn().mockReturnThis(),
                };
                const fakeRequest: any = {
                    query: {
                        url: "THE_URL",
                    },
                };
                jest.spyOn(KAShared, "trace").mockReturnValue({
                    end: jest.fn(),
                    addLabel: jest.fn(),
                });
                const fakeRenderEnvironment: any = {
                    render: jest.fn().mockReturnValue(Promise.reject()),
                };
                const fakeLogger = {
                    error: jest.fn(),
                };
                jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);
                const handler = makeRenderHandler(fakeRenderEnvironment);

                // Act
                /**
                 * Middleware<Request, Response> can mean two different call
                 * signatures, and sadly, they both have completely different
                 * argument type ordering, which totally confused flow here.
                 * $FlowIgnore
                 */
                await handler(fakeRequest, fakeResponse);

                // Assert
                expect(fakeResponse.status).toHaveBeenCalledWith(500);
            });

            it("should send the error in the response", async () => {
                // Arrange
                const fakeResponse: any = {
                    json: jest.fn().mockReturnThis(),
                    status: jest.fn().mockReturnThis(),
                };
                const fakeRequest: any = {
                    query: {
                        url: "THE_URL",
                    },
                };
                jest.spyOn(KAShared, "trace").mockReturnValue({
                    end: jest.fn(),
                    addLabel: jest.fn(),
                });
                const fakeRenderEnvironment: any = {
                    render: jest.fn().mockReturnValue(Promise.reject()),
                };
                const simplifiedError = {
                    error: "EXTRACTED_ERROR",
                };
                jest.spyOn(Shared, "extractError").mockReturnValue(
                    simplifiedError,
                );
                const fakeLogger = {
                    error: jest.fn(),
                };
                jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);
                const handler = makeRenderHandler(fakeRenderEnvironment);

                // Act
                /**
                 * Middleware<Request, Response> can mean two different call
                 * signatures, and sadly, they both have completely different
                 * argument type ordering, which totally confused flow here.
                 * $FlowIgnore
                 */
                await handler(fakeRequest, fakeResponse);

                // Assert
                expect(fakeResponse.json).toHaveBeenCalledWith(simplifiedError);
            });
        });
    });
});
