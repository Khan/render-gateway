// @flow
import * as TraceAgent from "@google-cloud/trace-agent";
import {startTraceAgent} from "../start-trace-agent.js";

jest.mock("@google-cloud/trace-agent");

describe("#startTraceAgent", () => {
    it("should start the trace agent as disabled when not in production", () => {
        // Arrange
        const startSpy = jest.spyOn(TraceAgent, "start");

        // Act
        startTraceAgent("development");

        // Assert
        expect(startSpy).toHaveBeenCalledWith({enabled: false});
    });

    it("should start the trace agent as enabled when in production", () => {
        // Arrange
        const startSpy = jest.spyOn(TraceAgent, "start");

        // Act
        startTraceAgent("production");

        // Assert
        expect(startSpy).toHaveBeenCalledWith({enabled: true});
    });

    it("should return the tracer", () => {
        // Arrange
        const pretendTracer = ({}: any);
        jest.spyOn(TraceAgent, "start").mockReturnValue(pretendTracer);

        // Act
        const result = startTraceAgent("production");

        // Assert
        expect(result).toBe(pretendTracer);
    });
});
