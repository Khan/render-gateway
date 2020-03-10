// @flow
import type {SuperAgentRequest} from "superagent";
import type {RenderGatewayOptions} from "./types.js";
import {isCacheable} from "./is-cacheable.js";
import type {Logger} from "./shared/index.js";
import {makeUnbufferedNoCacheRequest} from "./make-unbuffered-no-cache-request.js";
import {asCachedRequest, asUncachedRequest} from "./requests-from-cache.js";

/**
 * Make a request for a given URL
 *
 * Could resolve from cache if caching is enabled and the request has already
 * been fulfilled once. Otherwise, this creates a new request for the URL.
 *
 * The request will resolve with an additional _fromCache property, which will
 * indicate if it was resolved from cache or not.
 *
 * @param {RenderGatewayOptions} options The options used to start the gateway.
 * @param {string} url The URL to be requested.
 * @param {Logger} logger The logger to use.
 * @param {boolean} [buffer] Defaults to true. When true, the response body will
 * be buffered, otherwise it will not.
 * @returns {SuperAgentRequest} A superagent request for the URL.
 */
export const makeRequest = (
    options: RenderGatewayOptions,
    url: string,
    logger: Logger,
    buffer?: boolean = true,
): SuperAgentRequest => {
    /**
     * Create the base request with our various options.
     */
    const request = makeUnbufferedNoCacheRequest(options, url, logger);

    /**
     * We only add caching support if we were given a cache to use.
     * We also make sure that this request is something we want to cache.
     * We default to JS files only, but this can be overridden in the gateway
     * options.
     */
    const cacheOptions = options.requests?.caching;
    if (cacheOptions && isCacheable(url, cacheOptions.isCacheable)) {
        /**
         * If we get here, we are caching this request.
         */
        return asCachedRequest(request, cacheOptions, buffer);
    }

    /**
     * We're not caching this request, so let's just not set caching up.
     */
    return asUncachedRequest(request, buffer);
};
