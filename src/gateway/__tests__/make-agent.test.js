// @flow
import * as AgentKeepAlive from "agentkeepalive";
import {makeAgent} from "../make-agent.js";

import type {KeepAliveOptions} from "../types.js";

jest.mock("agentkeepalive");

describe("#makeAgent", () => {
    it("should pass keep alive options to agentkeepalive", () => {
        // Arrange
        const options: KeepAliveOptions = {
            workingSocketTimeout: 42,
            freeSocketTimeout: 84,
            maxFreeSockets: 255,
            maxSockets: 128,
        };
        const agentKeepAliveSpy = jest.spyOn(AgentKeepAlive, "HttpsAgent");

        // Act
        makeAgent(options);

        // Assert
        expect(agentKeepAliveSpy).toHaveBeenCalledWith({
            timeout: 42,
            freeSocketTimeout: 84,
            keepAlive: true,
            maxFreeSockets: 255,
            maxSockets: 128,
        });
    });

    it("should return agentkeepalive", () => {
        // Arrange
        const fakeAgent = {};
        jest.spyOn(AgentKeepAlive, "HttpsAgent").mockReturnValue(fakeAgent);

        // Act
        const result = makeAgent();

        // Assert
        expect(result).toBe(fakeAgent);
    });
});
