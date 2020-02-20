// @flow
import * as TraceAgent from "@google-cloud/trace-agent";
import {startTraceAgent} from "../start-trace-agent-impl.js";
import * as GetRuntimeMode from "../get-runtime-mode.js";

jest.mock("@google-cloud/trace-agent");
jest.mock("../get-runtime-mode.js");

describe("#startTraceAgent", () => {
    it("should start the trace agent as disabled when not in production", () => {
        // Arrange
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue(
            "development",
        );
        const startSpy = jest.spyOn(TraceAgent, "start");

        // Act
        startTraceAgent();

        // Assert
        expect(startSpy).toHaveBeenCalledWith({enabled: false});
    });

    it("should start the trace agent as enabled when in production", () => {
        // Arrange
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue(
            "production",
        );
        const startSpy = jest.spyOn(TraceAgent, "start");

        // Act
        startTraceAgent();

        // Assert
        expect(startSpy).toHaveBeenCalledWith({enabled: true});
    });

    it("should return the tracer", () => {
        // Arrange
        const pretendTracer = ({}: any);
        jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue(
            "production",
        );
        jest.spyOn(TraceAgent, "start").mockReturnValue(pretendTracer);

        // Act
        const result = startTraceAgent();

        // Assert
        expect(result).toBe(pretendTracer);
    });
});
