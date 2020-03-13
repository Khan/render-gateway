// @flow
import * as SuperagentCachePlugin from "superagent-cache-plugin";
import * as MakeAgent from "../make-agent.js";

import type {RequestsOptions} from "../types.js";

import {createRequestOptions} from "../create-request-options.js";

jest.mock("superagent-cache-plugin");
jest.mock("../make-agent.js");

describe("#createRequestOptions", () => {
    it("should apply defaults", () => {
        // Arrange
        /**
         * NOTHING
         */

        // Act
        const result = createRequestOptions();

        // Assert
        expect(result).toStrictEqual({
            buffer: true,
            timeout: 60000,
            retries: 2,
            agent: undefined,
            cachePlugin: null,
            getExpiration: undefined,
            isCacheable: undefined,
            shouldRetry: undefined,
        });
    });

    it("should invoke makeAgent with keepAlive options", () => {
        // Arrange
        const fakeKeepAliveOptions = "FAKE_KEEPALIVE";
        const fakeRequestsOptions: any = {
            keepAlive: fakeKeepAliveOptions,
        };
        const makeAgentSpy = jest.spyOn(MakeAgent, "makeAgent");

        // Act
        createRequestOptions(fakeRequestsOptions);

        // Assert
        expect(makeAgentSpy).toHaveBeenCalledWith(fakeKeepAliveOptions);
    });

    it("should create cache plugin when cache provider present", () => {
        // Arrange
        const fakeRequestsOptions: any = {
            caching: {
                provider: "FAKE_PROVIDER",
            },
        };
        const superagentCachePluginSpy = jest.spyOn(
            SuperagentCachePlugin,
            "default",
        );

        // Act
        createRequestOptions(fakeRequestsOptions);

        // Assert
        expect(superagentCachePluginSpy).toHaveBeenCalledWith("FAKE_PROVIDER");
    });

    it("should include options, agent, and plugin in created options", () => {
        // Arrange
        const fakeRequestsOptions: RequestsOptions = {
            retries: 10,
            timeout: 1000000000, // dollars, muhahahahhahahahahaaa 🤔
            shouldRetry: ("SHOULD_RETRY": any),
            caching: {
                provider: ("FAKE_PROVIDER": any),
                getExpiration: ("GET_EXPIRATION": any),
                isCacheable: ("IS_CACHEABLE": any),
            },
        };
        jest.spyOn(MakeAgent, "makeAgent").mockReturnValue("FAKE_AGENT");
        jest.spyOn(SuperagentCachePlugin, "default").mockReturnValue(
            "FAKE_CACHE",
        );

        // Act
        const result = createRequestOptions(fakeRequestsOptions);

        // Assert
        expect(result).toStrictEqual({
            agent: "FAKE_AGENT",
            cachePlugin: "FAKE_CACHE",
            retries: 10,
            timeout: 1000000000,
            shouldRetry: "SHOULD_RETRY",
            isCacheable: "IS_CACHEABLE",
            getExpiration: "GET_EXPIRATION",
            buffer: true,
        });
    });
});
