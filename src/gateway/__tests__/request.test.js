// @flow
import * as Shared from "../../shared/index.js";
import * as MakeRequest from "../make-request.js";
import * as RequestsFromCache from "../requests-from-cache.js";
import {request} from "../request.js";

jest.mock("../../shared/index.js");
jest.mock("../make-request.js");
jest.mock("../requests-from-cache.js");

describe("#request", () => {
    it("should create a child logger with the url of the request", () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
        const fakeLogger: any = {
            child: jest.fn().mockReturnValue(fakeChildLogger),
        };
        const fakeRequest: any = {
            abort: jest.fn(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeTraceSession: any = {
            addLabel: jest.fn(),
            end: jest.fn(),
        };
        jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
        jest.spyOn(MakeRequest, "makeRequest").mockReturnValue(fakeRequest);

        // Act
        request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(fakeLogger.child).toHaveBeenCalledWith({url: "URL"});
    });

    it("should start a trace", () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
        const fakeLogger: any = {
            child: jest.fn().mockReturnValue(fakeChildLogger),
        };
        const fakeRequest: any = {
            abort: jest.fn(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeTraceSession: any = {
            addLabel: jest.fn(),
            end: jest.fn(),
        };
        jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
        jest.spyOn(MakeRequest, "makeRequest").mockReturnValue(fakeRequest);
        const traceSpy = jest.spyOn(Shared, "trace");

        // Act
        request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(traceSpy).toHaveBeenCalledWith(
            "request",
            "URL",
            fakeChildLogger,
        );
    });

    it("should make a request including default options", () => {
        // Arrange
        const fakeOptions: any = {
            opt: "FAKE_OPTIONS",
        };
        const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
        const fakeLogger: any = {
            child: jest.fn().mockReturnValue(fakeChildLogger),
        };
        const fakeRequest: any = {
            abort: jest.fn(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeTraceSession: any = {
            addLabel: jest.fn(),
            end: jest.fn(),
        };
        jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
        const makeRequestSpy = jest
            .spyOn(MakeRequest, "makeRequest")
            .mockReturnValue(fakeRequest);

        // Act
        request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(makeRequestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                timeout: 60000,
                retries: 2,
                shouldRetry: expect.any(Function),
                opt: "FAKE_OPTIONS",
            }),
            fakeChildLogger,
            "URL",
        );
    });

    it("should start a trace before making the new request", () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
        const fakeLogger: any = {
            child: jest.fn().mockReturnValue(fakeChildLogger),
        };
        const fakeRequest: any = {
            abort: jest.fn(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeTraceSession: any = {
            addLabel: jest.fn(),
            end: jest.fn(),
        };
        const traceSpy = jest
            .spyOn(Shared, "trace")
            .mockReturnValue(fakeTraceSession);
        const makeRequestSpy = jest
            .spyOn(MakeRequest, "makeRequest")
            .mockReturnValue(fakeRequest);

        // Act
        request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(traceSpy).toHaveBeenCalledBefore(makeRequestSpy);
    });

    it("should return the new request", () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
        const fakeLogger: any = {
            child: jest.fn().mockReturnValue(fakeChildLogger),
        };
        const fakeRequest: any = {
            abort: jest.fn(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeTraceSession: any = {
            addLabel: jest.fn(),
            end: jest.fn(),
        };
        jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
        jest.spyOn(MakeRequest, "makeRequest").mockReturnValue(fakeRequest);

        // Act
        const result = request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(result).toBe(fakeRequest);
    });

    it("should end the trace session when the request rejects", async () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
        const fakeLogger: any = {
            child: jest.fn().mockReturnValue(fakeChildLogger),
        };
        const fakeRequest: any = {
            abort: jest.fn(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeTraceSession: any = {
            addLabel: jest.fn(),
            end: jest.fn(),
        };
        const rejectedRequest: any = Promise.reject("OOPS!");
        rejectedRequest.abort = jest.fn();
        jest.spyOn(MakeRequest, "makeRequest")
            .mockReturnValueOnce(rejectedRequest)
            .mockReturnValueOnce(fakeRequest);
        jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);

        // Act
        try {
            await request(fakeLogger, "URL", fakeOptions);
        } catch (e) {
            expect(e).toBe("OOPS!");
        }

        // Assert
        expect(fakeTraceSession.end).toHaveBeenCalledWith({
            retries: 0,
        });
    });

    it("should add cache and success info to the trace session when the request resolves", async () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
        const fakeLogger: any = {
            child: jest.fn().mockReturnValue(fakeChildLogger),
        };
        const fakeRequest: any = {
            abort: jest.fn(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeTraceSession: any = {
            addLabel: jest.fn(),
            end: jest.fn(),
        };
        const resolvedRequest: any = Promise.resolve("YAY!");
        resolvedRequest.abort = jest.fn();
        jest.spyOn(MakeRequest, "makeRequest")
            .mockReturnValueOnce(resolvedRequest)
            .mockReturnValueOnce(fakeRequest);
        jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
        jest.spyOn(RequestsFromCache, "getResponseSource").mockReturnValue(
            "FAKE_FROM_CACHE",
        );

        // Act
        await request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(fakeTraceSession.addLabel).toHaveBeenCalledWith(
            "source",
            "FAKE_FROM_CACHE",
        );
        expect(fakeTraceSession.addLabel).toHaveBeenCalledWith(
            "successful",
            true,
        );
    });

    it("should end the trace session when the request resolves", async () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
        const fakeLogger: any = {
            child: jest.fn().mockReturnValue(fakeChildLogger),
        };
        const fakeRequest: any = {
            abort: jest.fn(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeTraceSession: any = {
            addLabel: jest.fn(),
            end: jest.fn(),
        };
        const resolvedRequest: any = Promise.resolve("YAY!");
        resolvedRequest.abort = jest.fn();
        jest.spyOn(MakeRequest, "makeRequest")
            .mockReturnValueOnce(resolvedRequest)
            .mockReturnValueOnce(fakeRequest);
        jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
        jest.spyOn(RequestsFromCache, "getResponseSource").mockReturnValue(
            "FAKE_FROM_CACHE",
        );

        // Act
        await request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(fakeTraceSession.end).toHaveBeenCalledWith({retries: 0});
    });

    describe("options.shouldRetry passed to makeRequest", () => {
        it("should invoke the original shouldRetry with the error and response", () => {
            // Arrange
            const fakeOptions: any = {
                shouldRetry: jest.fn(),
            };
            const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
            const fakeLogger: any = {
                child: jest.fn().mockReturnValue(fakeChildLogger),
            };
            const fakeRequest: any = {
                abort: jest.fn(),
                then: jest.fn().mockReturnThis(),
                finally: jest.fn().mockReturnThis(),
            };
            const fakeTraceSession: any = {
                addLabel: jest.fn(),
                end: jest.fn(),
            };
            jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
            const makeRequestSpy = jest
                .spyOn(MakeRequest, "makeRequest")
                .mockReturnValue(fakeRequest);

            // Act
            request(fakeLogger, "URL", fakeOptions);
            const {shouldRetry} = makeRequestSpy.mock.calls[0][0];
            shouldRetry("ERROR", "RESPONSE");

            // Assert
            expect(fakeOptions.shouldRetry).toHaveBeenCalledWith(
                "ERROR",
                "RESPONSE",
            );
        });

        it.each([
            [() => true, true],
            [undefined, undefined],
        ])(
            "should return the result of the original shouldRetry if present",
            (shouldRetryOption, expectation) => {
                // Arrange
                const fakeOptions: any = {
                    shouldRetry: shouldRetryOption,
                };
                const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
                const fakeLogger: any = {
                    child: jest.fn().mockReturnValue(fakeChildLogger),
                };
                const fakeRequest: any = {
                    abort: jest.fn(),
                    then: jest.fn().mockReturnThis(),
                    finally: jest.fn().mockReturnThis(),
                };
                const fakeTraceSession: any = {
                    addLabel: jest.fn(),
                    end: jest.fn(),
                };
                jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
                const makeRequestSpy = jest
                    .spyOn(MakeRequest, "makeRequest")
                    .mockReturnValue(fakeRequest);

                // Act
                request(fakeLogger, "URL", fakeOptions);
                const {shouldRetry} = makeRequestSpy.mock.calls[0][0];
                const result = shouldRetry("ERROR", "RESPONSE");

                // Assert
                expect(result).toBe(expectation);
            },
        );

        it.each`
            errorArgs                    | expectation
            ${["ERR", "ERR", undefined]} | ${2}
            ${["ERR", undefined]}        | ${1}
            ${[undefined]}               | ${0}
        `(
            "should track retries when called with errors",
            async ({errorArgs, expectation}) => {
                // Arrange
                const fakeOptions: any = "FAKE_OPTIONS";
                const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
                const fakeLogger: any = {
                    child: jest.fn().mockReturnValue(fakeChildLogger),
                };
                const fakeRequest: any = {
                    abort: jest.fn(),
                    then: jest.fn().mockReturnThis(),
                    finally: jest.fn().mockReturnThis(),
                };
                const fakeTraceSession: any = {
                    addLabel: jest.fn(),
                    end: jest.fn(),
                };
                const resolvedRequest: any = Promise.resolve("YAY!");
                resolvedRequest.abort = jest.fn();
                const makeRequestSpy = jest
                    .spyOn(MakeRequest, "makeRequest")
                    .mockReturnValueOnce(resolvedRequest)
                    .mockReturnValueOnce(fakeRequest);
                jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
                jest.spyOn(
                    RequestsFromCache,
                    "getResponseSource",
                ).mockReturnValue("FAKE_FROM_CACHE");

                // Act
                const requestToAwait = request(fakeLogger, "URL", fakeOptions);
                const {shouldRetry} = makeRequestSpy.mock.calls[0][0];
                for (const errorArg of errorArgs) {
                    shouldRetry(errorArg);
                }
                await requestToAwait;

                // Assert
                expect(fakeTraceSession.end).toHaveBeenCalledWith({
                    retries: expectation,
                });
            },
        );
    });

    describe("returned request", () => {
        describe("#abort", () => {
            it("should call abort on the traced request", () => {
                // Arrange
                const fakeOptions: any = "FAKE_OPTIONS";
                const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
                const fakeLogger: any = {
                    child: jest.fn().mockReturnValue(fakeChildLogger),
                };
                const fakeThenFinallyPromise: any = {
                    then: jest.fn().mockReturnThis(),
                    finally: jest.fn().mockReturnThis(),
                };
                const fakeRequest: any = {
                    abort: jest.fn(),
                    then: jest.fn().mockReturnValue(fakeThenFinallyPromise),
                    finally: jest.fn().mockReturnValue(fakeThenFinallyPromise),
                };
                const fakeTraceSession: any = {
                    addLabel: jest.fn(),
                    end: jest.fn(),
                };
                jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
                jest.spyOn(MakeRequest, "makeRequest").mockReturnValue(
                    fakeRequest,
                );

                // Act
                const tracedRequest = request(fakeLogger, "URL", fakeOptions);
                tracedRequest.abort();

                // Assert
                expect(fakeRequest.abort).toHaveBeenCalled();
            });
        });

        describe("@aborted", () => {
            it("should return value of aborted on the traced request", () => {
                // Arrange
                const fakeOptions: any = "FAKE_OPTIONS";
                const fakeChildLogger: any = "FAKE_CHILD_LOGGER";
                const fakeLogger: any = {
                    child: jest.fn().mockReturnValue(fakeChildLogger),
                };
                const fakeThenFinallyPromise: any = {
                    then: jest.fn().mockReturnThis(),
                    finally: jest.fn().mockReturnThis(),
                };
                const fakeRequest: any = {
                    abort: jest.fn(),
                    aborted: "FAKE_ABORTED_VALUE",
                    then: jest.fn().mockReturnValue(fakeThenFinallyPromise),
                    finally: jest.fn().mockReturnValue(fakeThenFinallyPromise),
                };
                const fakeTraceSession: any = {
                    addLabel: jest.fn(),
                    end: jest.fn(),
                };
                jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
                jest.spyOn(MakeRequest, "makeRequest").mockReturnValue(
                    fakeRequest,
                );

                // Act
                const tracedRequest = request(fakeLogger, "URL", fakeOptions);
                const result = tracedRequest.aborted;

                // Assert
                expect(result).toBe(fakeRequest.aborted);
            });
        });
    });
});
