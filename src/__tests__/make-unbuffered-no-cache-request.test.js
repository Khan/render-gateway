// @flow
import * as Superagent from "superagent";
import * as MakeAgent from "../make-agent.js";
import * as MakeShouldRetry from "../make-should-retry.js";

import {makeUnbufferedNoCacheRequest} from "../make-unbuffered-no-cache-request.js";

jest.mock("superagent");
jest.mock("../make-agent.js");
jest.mock("../make-should-retry.js");

describe("#makeUnbufferedNoCacheRequest", () => {
    const GAE_VERSION = process.env.GAE_VERSION;
    afterEach(() => {
        process.env.GAE_VERSION = GAE_VERSION;
    });

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
        jest.spyOn(Superagent, "agent").mockReturnValue(fakeSuperagent);
        const makeAgentSpy = jest.spyOn(MakeAgent, "makeAgent");

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, "URL", fakeLogger);

        // Assert
        expect(makeAgentSpy).toHaveBeenCalledWith(fakeKeepAlive);
    });

    it("should apply the agent to the request", () => {
        // Arrange
        const fakeSuperagent = {
            get: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        };
        const fakeAgent = "FAKE_AGENT";
        const fakeKeepAlive = "FAKE KEEP ALIVE";
        const fakeOptions: any = {
            requests: {
                keepAlive: fakeKeepAlive,
            },
        };
        const fakeLogger: any = {};
        jest.spyOn(MakeAgent, "makeAgent").mockReturnValue(fakeAgent);
        const agentSpy = jest
            .spyOn(Superagent, "agent")
            .mockReturnValue(fakeSuperagent);

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, "URL", fakeLogger);

        // Assert
        expect(agentSpy).toHaveBeenCalledWith(fakeAgent);
    });

    it("should get the URL", () => {
        // Arrange
        const fakeSuperagent = {
            get: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        };
        const fakeAgent = "FAKE_AGENT";
        const fakeKeepAlive = "FAKE KEEP ALIVE";
        const fakeOptions: any = {
            requests: {
                keepAlive: fakeKeepAlive,
            },
        };
        const fakeLogger: any = {};
        jest.spyOn(MakeAgent, "makeAgent").mockReturnValue(fakeAgent);
        jest.spyOn(Superagent, "agent").mockReturnValue(fakeSuperagent);

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, "URL", fakeLogger);

        // Assert
        expect(fakeSuperagent.get).toHaveBeenCalledWith("URL");
    });

    it("should default retries to 2", () => {
        // Arrange
        const fakeSuperagent = {
            get: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        };
        const fakeAgent = "FAKE_AGENT";
        const fakeKeepAlive = "FAKE KEEP ALIVE";
        const fakeOptions: any = {
            requests: {
                keepAlive: fakeKeepAlive,
            },
        };
        const fakeShouldRetry = jest.fn();
        const fakeLogger: any = {};
        jest.spyOn(MakeAgent, "makeAgent").mockReturnValue(fakeAgent);
        jest.spyOn(Superagent, "agent").mockReturnValue(fakeSuperagent);
        jest.spyOn(MakeShouldRetry, "makeShouldRetry").mockReturnValue(
            fakeShouldRetry,
        );

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, "URL", fakeLogger);

        // Assert
        expect(fakeSuperagent.retry).toHaveBeenCalledWith(2, fakeShouldRetry);
    });

    it("should use retries count from options", () => {
        // Arrange
        const fakeSuperagent = {
            get: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        };
        const fakeAgent = "FAKE_AGENT";
        const fakeKeepAlive = "FAKE KEEP ALIVE";
        const fakeOptions: any = {
            requests: {
                retries: 42,
                keepAlive: fakeKeepAlive,
            },
        };
        const fakeShouldRetry = jest.fn();
        const fakeLogger: any = {};
        jest.spyOn(MakeAgent, "makeAgent").mockReturnValue(fakeAgent);
        jest.spyOn(Superagent, "agent").mockReturnValue(fakeSuperagent);
        jest.spyOn(MakeShouldRetry, "makeShouldRetry").mockReturnValue(
            fakeShouldRetry,
        );

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, "URL", fakeLogger);

        // Assert
        expect(fakeSuperagent.retry).toHaveBeenCalledWith(42, fakeShouldRetry);
    });

    it("should make shouldRetry with override from options and logger", () => {
        // Arrange
        const fakeSuperagent = {
            get: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        };
        const fakeAgent = "FAKE_AGENT";
        const fakeKeepAlive = "FAKE KEEP ALIVE";
        const fakeOptions: any = {
            requests: {
                shouldRetry: jest.fn(),
                keepAlive: fakeKeepAlive,
            },
        };
        const fakeLogger: any = {};
        jest.spyOn(MakeAgent, "makeAgent").mockReturnValue(fakeAgent);
        jest.spyOn(Superagent, "agent").mockReturnValue(fakeSuperagent);
        const makeShouldRetrySpy = jest.spyOn(
            MakeShouldRetry,
            "makeShouldRetry",
        );

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, "URL", fakeLogger);

        // Assert
        expect(makeShouldRetrySpy).toHaveBeenCalledWith(
            fakeLogger,
            fakeOptions.requests.shouldRetry,
        );
    });

    it("should set the User-Agent header with gateway name and GAE_VERSION", () => {
        // Arrange
        process.env.GAE_VERSION = "TEST_GAE_VERSION";
        const fakeSuperagent = {
            get: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        };
        const fakeAgent = "FAKE_AGENT";
        const fakeKeepAlive = "FAKE KEEP ALIVE";
        const fakeOptions: any = {
            name: "test-render-gateway",
            requests: {
                keepAlive: fakeKeepAlive,
            },
        };
        const fakeLogger: any = {};
        jest.spyOn(MakeAgent, "makeAgent").mockReturnValue(fakeAgent);
        jest.spyOn(Superagent, "agent").mockReturnValue(fakeSuperagent);

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, "URL", fakeLogger);

        // Assert
        expect(fakeSuperagent.set).toHaveBeenCalledWith(
            "User-Agent",
            "test-render-gateway (TEST_GAE_VERSION)",
        );
    });

    it("should set the User-Agent header with gateway name and UNKNOWN if GAE_VERSION not set", () => {
        // Arrange
        /**
         * We have to delete the env var.
         * If we just set it to `undefined` it actually gets set to the string
         * "undefined", which is not what we want at all.
         */
        delete process.env.GAE_VERSION;
        const fakeSuperagent = {
            get: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        };
        const fakeAgent = "FAKE_AGENT";
        const fakeKeepAlive = "FAKE KEEP ALIVE";
        const fakeOptions: any = {
            name: "test-render-gateway",
            requests: {
                keepAlive: fakeKeepAlive,
            },
        };
        const fakeLogger: any = {};
        jest.spyOn(MakeAgent, "makeAgent").mockReturnValue(fakeAgent);
        jest.spyOn(Superagent, "agent").mockReturnValue(fakeSuperagent);

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, "URL", fakeLogger);

        // Assert
        expect(fakeSuperagent.set).toHaveBeenCalledWith(
            "User-Agent",
            "test-render-gateway (UNKNOWN)",
        );
    });

    it("should default timeout to 1 minute (60000 ms)", () => {
        // Arrange
        const fakeSuperagent = {
            get: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        };
        const fakeAgent = "FAKE_AGENT";
        const fakeKeepAlive = "FAKE KEEP ALIVE";
        const fakeOptions: any = {
            requests: {
                keepAlive: fakeKeepAlive,
            },
        };
        const fakeShouldRetry = jest.fn();
        const fakeLogger: any = {};
        jest.spyOn(MakeAgent, "makeAgent").mockReturnValue(fakeAgent);
        jest.spyOn(Superagent, "agent").mockReturnValue(fakeSuperagent);
        jest.spyOn(MakeShouldRetry, "makeShouldRetry").mockReturnValue(
            fakeShouldRetry,
        );

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, "URL", fakeLogger);

        // Assert
        expect(fakeSuperagent.timeout).toHaveBeenCalledWith(60000);
    });

    it("should set timeout from options", () => {
        // Arrange
        const fakeSuperagent = {
            get: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        };
        const fakeAgent = "FAKE_AGENT";
        const fakeKeepAlive = "FAKE KEEP ALIVE";
        const fakeOptions: any = {
            requests: {
                timeout: 42,
                keepAlive: fakeKeepAlive,
            },
        };
        const fakeShouldRetry = jest.fn();
        const fakeLogger: any = {};
        jest.spyOn(MakeAgent, "makeAgent").mockReturnValue(fakeAgent);
        jest.spyOn(Superagent, "agent").mockReturnValue(fakeSuperagent);
        jest.spyOn(MakeShouldRetry, "makeShouldRetry").mockReturnValue(
            fakeShouldRetry,
        );

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, "URL", fakeLogger);

        // Assert
        expect(fakeSuperagent.timeout).toHaveBeenCalledWith(42);
    });
});
