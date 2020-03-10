// @flow
import * as Superagent from "superagent";
import * as MakeAgent from "../make-agent.js";
//import * as MakeShouldRetry from "../make-should-retry.js";

import {makeUnbufferedNoCacheRequest} from "../make-unbuffered-no-cache-request.js";

jest.mock("superagent");
jest.mock("../make-agent.js");
jest.mock("../make-should-retry.js");

describe("#makeUnbufferedNoCacheRequest", () => {
    it("should create an agent for the request", () => {
        // Arrange
        const fakeSuperagent = {
            get: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        };
        const fakeKeepAlive = "FAKE KEEP ALIVE";
        const fakeOptions: any = {
            requests: {
                keepAlive: fakeKeepAlive,
            },
        };
        const fakeLogger: any = {};
        const makeAgentSpy = jest.spyOn(MakeAgent, "makeAgent");
        jest.spyOn(Superagent, "agent").mockReturnValue(fakeSuperagent);

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, "URL", fakeLogger);

        // Assert
        expect(makeAgentSpy).toHaveBeenCalledWith(fakeKeepAlive);
    });
});
