// @flow
import * as Shared from "../../shared/index.js";
import * as MakeRequest from "../make-request.js";
import * as RequestsFromCache from "../requests-from-cache.js";
import {request, abortInFlightRequests} from "../request.js";

jest.mock("../../shared/index.js");
jest.mock("../make-request.js");
jest.mock("../requests-from-cache.js");

describe("#abortInFlightRequests", () => {
    beforeEach(() => {
        /**
         * Some test cases might add to the in-flight list.
         * Let's make sure it gets cleared.
         */
        abortInFlightRequests();
    });

    it("should call abort on requests", () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeTraceSession: any = {
            addLabel: jest.fn(),
            end: jest.fn(),
        };
        jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
        jest.spyOn(MakeRequest, "makeRequest").mockReturnValue(fakeRequest);
        request(fakeLogger, "URL", fakeOptions);

        // Act
        abortInFlightRequests();

        // Assert
        expect(fakeRequest.abort).toHaveBeenCalledTimes(1);
    });

    it("should remove requests from the in-flight list", () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeRequest2: any = {
            abort: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeTraceSession: any = {
            addLabel: jest.fn(),
            end: jest.fn(),
        };
        jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
        jest.spyOn(MakeRequest, "makeRequest")
            .mockReturnValueOnce(fakeRequest)
            .mockReturnValue(fakeRequest2);
        request(fakeLogger, "URL", fakeOptions);

        // Act
        abortInFlightRequests();
        const result = request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(result).toBe(fakeRequest2);
    });
});

describe("#request", () => {
    beforeEach(() => {
        /**
         * Some test cases might add to the in-flight list.
         * Let's make sure it gets cleared.
         */
        abortInFlightRequests();
    });

    it("should start a trace", () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
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
        expect(traceSpy).toHaveBeenCalledWith("request", "URL", fakeLogger);
    });

    it("should make a request including default options", () => {
        // Arrange
        const fakeOptions: any = {
            opt: "FAKE_OPTIONS",
        };
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
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
                buffer: true,
                timeout: 60000,
                retries: 2,
                opt: "FAKE_OPTIONS",
            }),
            fakeLogger,
            "URL",
        );
    });

    it("should start a trace before making the new request", () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
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
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
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

    it("should return in-flight request if one is in-flight", () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
            finally: jest.fn().mockReturnThis(),
        };
        const fakeTraceSession: any = {
            addLabel: jest.fn(),
            end: jest.fn(),
        };
        jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);
        jest.spyOn(MakeRequest, "makeRequest").mockReturnValueOnce(fakeRequest);

        // Act
        request(fakeLogger, "URL", fakeOptions);
        const result = request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(result).toBe(fakeRequest);
    });

    it("should delete rejected requests from in-flight list", async () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
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
        let result;
        try {
            await request(fakeLogger, "URL", fakeOptions);
        } catch (e) {
            expect(e).toBe("OOPS!");
            result = request(fakeLogger, "URL", fakeOptions);
        }

        // Assert
        expect(result).toBe(fakeRequest);
    });

    it("should delete resolved requests from in-flight list", async () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
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

        // Act
        await request(fakeLogger, "URL", fakeOptions);
        const result = request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(result).toBe(fakeRequest);
    });

    it("should end the trace session when the request rejects", async () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
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
        expect(fakeTraceSession.end).toHaveBeenCalled();
    });

    it("should add cache and success info to the trace session when the request resolves", async () => {
        // Arrange
        const fakeOptions: any = "FAKE_OPTIONS";
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
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
        jest.spyOn(RequestsFromCache, "isFromCache").mockReturnValue(
            "FAKE_FROM_CACHE",
        );

        // Act
        await request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(fakeTraceSession.addLabel).toHaveBeenCalledWith(
            "fromCache",
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
        const fakeLogger: any = "FAKE_LOGGER";
        const fakeRequest: any = {
            abort: jest.fn().mockReturnThis(),
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
        jest.spyOn(RequestsFromCache, "isFromCache").mockReturnValue(
            "FAKE_FROM_CACHE",
        );

        // Act
        await request(fakeLogger, "URL", fakeOptions);

        // Assert
        expect(fakeTraceSession.end).toHaveBeenCalled();
    });
});
