// @flow
import * as KAShared from "../../../ka-shared/index.js";
import * as HandleError from "../handle-error.js";
import {makeRenderHandler} from "../make-render-handler.js";

jest.mock("../../../ka-shared/index.js");
jest.mock("../handle-error.js");

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
                header: jest.fn().mockReturnThis(),
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
                header: jest.fn().mockReturnThis(),
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
                header: jest.fn().mockReturnThis(),
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
                header: jest.fn().mockReturnThis(),
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
                    getTrackedHeaders: expect.any(Function),
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
                        header: jest.fn().mockReturnThis(),
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

            describe("#getTrackedHeaders", () => {
                it("should return headers that were accessed via getHeader and existed in the request", async () => {
                    // Arrange
                    const fakeResponse: any = {
                        send: jest.fn().mockReturnThis(),
                        status: jest.fn().mockReturnThis(),
                        header: jest.fn().mockReturnThis(),
                    };
                    const fakeRequest: any = {
                        query: {
                            url: "THE_URL",
                        },
                        header: jest
                            .fn()
                            .mockReturnValueOnce("HEADER_VALUE1")
                            .mockReturnValueOnce("HEADER_VALUE2")
                            .mockReturnValueOnce("HEADER_VALUE3"),
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
                    const getHeader =
                        fakeRenderEnvironment.render.mock.calls[0][1].getHeader;
                    const getTrackedHeaders =
                        fakeRenderEnvironment.render.mock.calls[0][1]
                            .getTrackedHeaders;

                    // Act
                    getHeader("HEADER1");
                    getHeader("HEADER2");
                    getHeader("HEADER3");
                    getHeader("HEADER4");
                    const result = getTrackedHeaders();

                    //Assert
                    expect(result).toStrictEqual({
                        HEADER1: "HEADER_VALUE1",
                        HEADER2: "HEADER_VALUE2",
                        HEADER3: "HEADER_VALUE3",
                    });
                });
            });

            describe("#trace", () => {
                it("should call trace", async () => {
                    // Arrange
                    const fakeResponse: any = {
                        send: jest.fn().mockReturnThis(),
                        status: jest.fn().mockReturnThis(),
                        header: jest.fn().mockReturnThis(),
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
            it("should attach the headers to the response", async () => {
                // Arrange
                const fakeResponse: any = {
                    send: jest.fn().mockReturnThis(),
                    status: jest.fn().mockReturnThis(),
                    header: jest.fn().mockReturnThis(),
                };
                const fakeRequest: any = {
                    query: {
                        url: "THE_URL",
                    },
                };
                const renderResult = {
                    body: "BODY",
                    status: 200,
                    headers: {
                        NAME1: "VALUE1",
                        NAME2: "VALUE2",
                    },
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
                expect(fakeResponse.header).toHaveBeenCalledWith({
                    NAME1: "VALUE1",
                    NAME2: "VALUE2",
                });
            });

            it.each([301, 302, 308, 307])(
                "should error if status was %s redirect but Location header is missing",
                async (redirectStatus) => {
                    // Arrange
                    const fakeResponse: any = {
                        send: jest.fn().mockReturnThis(),
                        status: jest.fn().mockReturnThis(),
                        header: jest.fn().mockReturnThis(),
                    };
                    const fakeRequest: any = {
                        query: {
                            url: "THE_URL",
                        },
                    };
                    const renderResult = {
                        body: "BODY",
                        status: redirectStatus,
                        headers: {
                            NAME1: "VALUE1",
                            NAME2: "VALUE2",
                        },
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
                    const fakeLogger = {
                        error: jest.fn(),
                    };
                    jest.spyOn(KAShared, "getLogger").mockReturnValue(
                        fakeLogger,
                    );
                    const handleErrorSpy = jest.spyOn(
                        HandleError,
                        "handleError",
                    );
                    const customErrorHandler = jest.fn();
                    const handler = makeRenderHandler(
                        fakeRenderEnvironment,
                        customErrorHandler,
                        "ERROR_RESPONSE",
                    );

                    // Act
                    /**
                     * Middleware<Request, Response> can mean two different call
                     * signatures, and sadly, they both have completely different
                     * argument type ordering, which totally confused flow here.
                     * $FlowIgnore
                     */
                    await handler(fakeRequest, fakeResponse);

                    // Assert
                    expect(handleErrorSpy).toHaveBeenCalledWith(
                        "Render failed",
                        customErrorHandler,
                        "ERROR_RESPONSE",
                        fakeRequest,
                        fakeResponse,
                        expect.objectContaining({
                            message:
                                "Render resulted in redirection status without required Location header",
                        }),
                    );
                },
            );

            it("should set status of response from render result", async () => {
                // Arrange
                const fakeResponse: any = {
                    send: jest.fn().mockReturnThis(),
                    status: jest.fn().mockReturnThis(),
                    header: jest.fn().mockReturnThis(),
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
                    header: jest.fn().mockReturnThis(),
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

        it("should defer to handleError when the render callback", async () => {
            // Arrange
            const fakeResponse: any = {
                send: jest.fn().mockReturnThis(),
                status: jest.fn().mockReturnThis(),
                header: jest.fn().mockReturnThis(),
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
                render: jest
                    .fn()
                    .mockReturnValue(Promise.reject(new Error("ERROR!"))),
            };
            const fakeLogger = {
                error: jest.fn(),
            };
            const customErrorHandler = jest.fn();
            jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);
            const handler = makeRenderHandler(
                fakeRenderEnvironment,
                customErrorHandler,
                "ERROR_RESPONSE",
            );
            const handleErrorSpy = jest.spyOn(HandleError, "handleError");

            // Act
            /**
             * Middleware<Request, Response> can mean two different call
             * signatures, and sadly, they both have completely different
             * argument type ordering, which totally confused flow here.
             * $FlowIgnore
             */
            await handler(fakeRequest, fakeResponse);

            // Assert
            expect(handleErrorSpy).toHaveBeenCalledWith(
                "Render failed",
                customErrorHandler,
                "ERROR_RESPONSE",
                fakeRequest,
                fakeResponse,
                expect.objectContaining({message: "ERROR!"}),
            );
        });
    });
});
