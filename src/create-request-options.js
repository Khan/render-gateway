// @flow
import superagentCachePlugin from "superagent-cache-plugin";
import type {RequestsOptions, RequestOptions} from "./types.js";
import {makeAgent} from "./make-agent.js";

/**
 * Creates request options from the gateway's requests options.
 *
 * This will create the HTTP agent and superagent-cache-plugin instances for
 * sharing across all requests.
 *
 * Callers should invoke this once and use the result as the basis for any
 * request options they build so that the agent and cache are shared
 * appropriately.
 */
export const createRequestOptions = (
    requestsOptions: ?RequestsOptions,
): RequestOptions => {
    const defaultRequestOptions = {
        buffer: true,
        retries: 2,
        timeout: 60000,
    };

    const {keepAlive, caching, retries, shouldRetry, timeout} =
        requestsOptions || {};

    const agent = makeAgent(keepAlive);
    const cachePlugin =
        caching == null ? null : superagentCachePlugin(caching.provider);

    const requestOptions: RequestOptions = {
        agent,
        buffer: defaultRequestOptions.buffer,
        cachePlugin,
        retries: retries || defaultRequestOptions.retries,
        shouldRetry,
        timeout: timeout || defaultRequestOptions.timeout,
        getExpiration: caching?.getExpiration,
        isCacheable: caching?.isCacheable,
    };

    return requestOptions;
};
