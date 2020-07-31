// @flow
import * as Shared from "../../../shared/index.js";
import * as HandleError from "../handle-error.js";
import {makeRenderHandler} from "../make-render-handler.js";

jest.mock("../../../shared/index.js");
jest.mock("../handle-error.js");

describe("#makeRenderHandler", () => {
    beforeEach(() => {
        // Let's make sure KAError still works.
        jest.spyOn(Shared, "KAError").mockImplementation((...args) => {
            const {KAError} = jest.requireActual("../../../shared/index.js");
            return new KAError(args);
        });
    });

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
            const nextFn = jest.fn();
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
            jest.spyOn(Shared, "trace").mockReturnValue({
                end: jest.fn(),
                addLabel: jest.fn(),
            });
            const getLoggerSpy = jest.spyOn(Shared, "getLogger");
            const handler = makeRenderHandler(fakeRenderEnvironment);

            // Act
            /**
             * $FlowIgnore[incompatible-call] Middleware<Request, Response>
             * can mean two different call signatures, and sadly, they both
             * have completely different argument type ordering, which
             * totally confused flow here.
             */
            await handler(fakeRequest, fakeResponse, nextFn);

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
            const nextFn = jest.fn();
            const renderResult = {
                body: "BODY",
                status: 200,
                headers: {},
            };
            jest.spyOn(Shared, "trace").mockReturnValue({
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
             * $FlowIgnore[incompatible-call] Middleware<Request, Response>
             * can mean two different call signatures, and sadly, they both
             * have completely different argument type ordering, which
             * totally confused flow here.
             */
            const underTest = handler(fakeRequest, fakeResponse, nextFn);

            // Assert
            expect(underTest).rejects.toThrowErrorMatchingInlineSnapshot(
                `"Missing url query param,InvalidInput"`,
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
            const nextFn = jest.fn();
            const renderResult = {
                body: "BODY",
                status: 200,
                headers: {},
            };
            jest.spyOn(Shared, "trace").mockReturnValue({
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
             * $FlowIgnore[incompatible-call] Middleware<Request, Response>
             * can mean two different call signatures, and sadly, they both
             * have completely different argument type ordering, which
             * totally confused flow here.
             */
            const underTest = handler(fakeRequest, fakeResponse, nextFn);

            // Assert
            expect(underTest).rejects.toThrowErrorMatchingInlineSnapshot(
                `"More than one url query param given,InvalidInput"`,
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
                headers: {
                    HEADER_NAME: "HEADER_VALUE",
                },
            };
            const nextFn = jest.fn();
            jest.spyOn(Shared, "trace").mockReturnValue({
                end: jest.fn(),
                addLabel: jest.fn(),
            });
            const fakeLogger = "FAKE_LOGGER";
            jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
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
             * $FlowIgnore[incompatible-call] Middleware<Request, Response>
             * can mean two different call signatures, and sadly, they both
             * have completely different argument type ordering, which
             * totally confused flow here.
             */
            await handler(fakeRequest, fakeResponse, nextFn);

            // Assert
            expect(fakeRenderEnvironment.render).toHaveBeenCalledWith(
                "THE_URL",
                {
                    logger: fakeLogger,
                    trace: expect.any(Function),
                    headers: {
                        HEADER_NAME: "HEADER_VALUE",
                    },
                },
            );
        });

        describe("provided render API", () => {
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
                    const nextFn = jest.fn();
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
                        .spyOn(Shared, "trace")
                        .mockReturnValue({
                            end: jest.fn(),
                            addLabel: jest.fn(),
                        });
                    const handler = makeRenderHandler(fakeRenderEnvironment);
                    /**
                     * $FlowIgnore[incompatible-call]
                     *
                     * Middleware<Request, Response> can mean two different
                     * call signatures, and sadly, they both have completely
                     * different argument type ordering, which totally confused
                     * flow here.
                     */
                    await handler(fakeRequest, fakeResponse, nextFn);
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
                const nextFn = jest.fn();
                const renderResult = {
                    body: "BODY",
                    status: 200,
                    headers: {
                        NAME1: "VALUE1",
                        NAME2: "VALUE2",
                    },
                };
                jest.spyOn(Shared, "trace").mockReturnValue({
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
                 * $FlowIgnore[incompatible-call] Middleware<Request, Response>
                 * can mean two different call signatures, and sadly, they both
                 * have completely different argument type ordering, which
                 * totally confused flow here.
                 */
                await handler(fakeRequest, fakeResponse, nextFn);

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
                    const nextFn = jest.fn();
                    const renderResult = {
                        body: "BODY",
                        status: redirectStatus,
                        headers: {
                            NAME1: "VALUE1",
                            NAME2: "VALUE2",
                        },
                    };
                    jest.spyOn(Shared, "trace").mockReturnValue({
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
                    jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
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
                     * $FlowIgnore[incompatible-call]
                     * Middleware<Request, Response> can mean two different
                     * call signatures, and sadly, they both have completely
                     * different argument type ordering, which totally confused
                     * flow here.
                     */
                    await handler(fakeRequest, fakeResponse, nextFn);

                    // Assert
                    expect(handleErrorSpy).toHaveBeenCalledWith(
                        "Render failed",
                        customErrorHandler,
                        "ERROR_RESPONSE",
                        fakeRequest,
                        fakeResponse,
                        expect.objectContaining({
                            message: expect.stringContaining(
                                "Render resulted in redirection status without required Location header",
                            ),
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
                const nextFn = jest.fn();
                const renderResult = {
                    body: "BODY",
                    status: 200,
                    headers: {},
                };
                jest.spyOn(Shared, "trace").mockReturnValue({
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
                 * $FlowIgnore[incompatible-call] Middleware<Request, Response>
                 * can mean two different call signatures, and sadly, they both
                 * have completely different argument type ordering, which
                 * totally confused flow here.
                 */
                await handler(fakeRequest, fakeResponse, nextFn);

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
                const nextFn = jest.fn();
                const renderResult = {
                    body: "BODY",
                    status: 200,
                    headers: {},
                };
                jest.spyOn(Shared, "trace").mockReturnValue({
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
                 * $FlowIgnore[incompatible-call] Middleware<Request, Response>
                 * can mean two different call signatures, and sadly, they both
                 * have completely different argument type ordering, which
                 * totally confused flow here.
                 */
                await handler(fakeRequest, fakeResponse, nextFn);

                // Assert
                expect(fakeResponse.send).toHaveBeenCalledWith("BODY");
            });

            it("should call next", async () => {
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
                const nextFn = jest.fn();
                const renderResult = {
                    body: "BODY",
                    status: 200,
                    headers: {},
                };
                jest.spyOn(Shared, "trace").mockReturnValue({
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
                 * $FlowIgnore[incompatible-call] Middleware<Request, Response>
                 * can mean two different call signatures, and sadly, they both
                 * have completely different argument type ordering, which
                 * totally confused flow here.
                 */
                await handler(fakeRequest, fakeResponse, nextFn);

                // Assert
                expect(nextFn).toHaveBeenCalled();
            });
        });

        describe("when render callback rejects", () => {
            it("should defer to handleError", async () => {
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
                const nextFn = jest.fn();
                jest.spyOn(Shared, "trace").mockReturnValue({
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
                jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
                const handler = makeRenderHandler(
                    fakeRenderEnvironment,
                    customErrorHandler,
                    "ERROR_RESPONSE",
                );
                const handleErrorSpy = jest.spyOn(HandleError, "handleError");

                // Act
                /**
                 * $FlowIgnore[incompatible-call] Middleware<Request, Response>
                 * can mean two different call signatures, and sadly, they both
                 * have completely different argument type ordering, which
                 * totally confused flow here.
                 */
                await handler(fakeRequest, fakeResponse, nextFn);

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

            it("should call next", async () => {
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
                const nextFn = jest.fn();
                jest.spyOn(Shared, "trace").mockReturnValue({
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
                jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);
                const handler = makeRenderHandler(
                    fakeRenderEnvironment,
                    customErrorHandler,
                    "ERROR_RESPONSE",
                );

                // Act
                /**
                 * $FlowIgnore[incompatible-call] Middleware<Request, Response>
                 * can mean two different call signatures, and sadly, they both
                 * have completely different argument type ordering, which
                 * totally confused flow here.
                 */
                await handler(fakeRequest, fakeResponse, nextFn);

                // Assert
                expect(nextFn).toHaveBeenCalled();
            });
        });
    });
});
