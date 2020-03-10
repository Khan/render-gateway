// @flow
import * as TraceAgent from "@google-cloud/trace-agent";
import * as Shared from "../../shared/index.js";
import * as GetLogger from "../get-logger.js";

import {trace} from "../trace.js";

jest.mock("@google-cloud/trace-agent");
jest.mock("../../shared/index.js");
jest.mock("../get-logger.js");

describe("#trace", () => {
    it("should pass request to getLogger", () => {
        // Arrange
        const fakeRequest: any = ({
            url: "",
        }: any);
        const fakeLogger: any = ({}: any);
        const fakeTracer: any = ({}: any);
        jest.spyOn(TraceAgent, "get").mockReturnValue(fakeTracer);
        const getLoggerSpy = jest
            .spyOn(GetLogger, "getLogger")
            .mockReturnValue(fakeLogger);

        // Act
        trace("TRACE_THIS!", fakeRequest);

        // Assert
        expect(getLoggerSpy).toHaveBeenCalledWith(fakeRequest);
    });

    it("should invoke the shared trace implementation with the logger and tracer", () => {
        // Arrange
        const fakeLogger: any = ({}: any);
        const fakeTracer: any = ({}: any);
        jest.spyOn(TraceAgent, "get").mockReturnValue(fakeTracer);
        jest.spyOn(GetLogger, "getLogger").mockReturnValue(fakeLogger);
        const traceImplSpy = jest.spyOn(Shared, "trace");

        // Act
        trace("TRACE_THIS!");

        // Assert
        expect(traceImplSpy).toHaveBeenCalledWith(
            fakeLogger,
            "TRACE_THIS!",
            fakeTracer,
        );
    });

    it("should return the trace session", () => {
        // Arrange
        const fakeTraceSession: any = ({}: any);
        const fakeLogger: any = ({}: any);
        const fakeTracer: any = ({}: any);
        jest.spyOn(TraceAgent, "get").mockReturnValue(fakeTracer);
        jest.spyOn(GetLogger, "getLogger").mockReturnValue(fakeLogger);
        jest.spyOn(Shared, "trace").mockReturnValue(fakeTraceSession);

        // Act
        const result = trace("TRACE_THIS!");

        // Assert
        expect(result).toBe(fakeTraceSession);
    });
});
