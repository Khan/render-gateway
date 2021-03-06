// @flow
import * as StartTraceAgent from "../start-trace-agent-impl.js";

jest.mock("../start-trace-agent-impl.js");

describe("start-trace-agent.js export", () => {
    it("should invoke startTraceAgent on import", async () => {
        // Arrange
        const startTraceAgentSpy = jest.spyOn(
            StartTraceAgent,
            "startTraceAgent",
        );

        // Act
        await import("../start-trace-agent.js");

        // Assert
        expect(startTraceAgentSpy).toHaveBeenCalledTimes(1);
    });
});
