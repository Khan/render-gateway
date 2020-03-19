// @flow
import type {Response as SuperAgentResponse} from "superagent";
import type {RequestOptions, AbortablePromise} from "./types.js";
import {isCacheable} from "./is-cacheable.js";
import type {Logger} from "../shared/index.js";
import {makeUnbufferedNoCacheRequest} from "./make-unbuffered-no-cache-request.js";
import {asCachedRequest, asUncachedRequest} from "./requests-from-cache.js";

/**
 * Make a request for a given URL
 *
 * Could resolve from cache if caching is enabled and the request has already
 * been fulfilled once. Otherwise, this creates a new request for the URL.
 *
 * The request will resolve with an additional property, which will
 * indicate if it was resolved from cache or not.
 *
 * @param {RequestOptions} options The options used to configure the request.
 * @param {Logger} logger The logger to use.
 * @param {string} url The URL to be requested.
 * @returns {Promise<SuperAgentResponse>} A superagent request for the URL.
 */
export const makeRequest = (
    options: RequestOptions,
    logger: Logger,
    url: string,
): AbortablePromise<SuperAgentResponse> => {
    /**
     * Create the base request with our various options.
     */
    const request = makeUnbufferedNoCacheRequest(options, logger, url);

    /**
     * We only add caching support if we were given a cache to use.
     * We also make sure that this request is something we want to cache.
     * We default to JS files only, but this can be overridden in the gateway
     * options.
     */
    if (options.cachePlugin && isCacheable(url, options.isCacheable)) {
        /**
         * If we get here, we are caching this request.
         */
        return asCachedRequest(options, request);
    }

    /**
     * We're not caching this request, so let's just not set caching up.
     */
    return asUncachedRequest(options, request);
};
