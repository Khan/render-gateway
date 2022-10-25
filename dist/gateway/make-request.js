"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeRequest = void 0;
var _isCacheable = require("./is-cacheable.js");
var _makeUnbufferedNoCacheRequest = require("./make-unbuffered-no-cache-request.js");
var _requestsFromCache = require("./requests-from-cache.js");

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
const makeRequest = (options, logger, url) => {
  /**
   * Create the base request with our various options.
   */
  const request = (0, _makeUnbufferedNoCacheRequest.makeUnbufferedNoCacheRequest)(options, logger, url);
  // We know request doesn't have this, but we want it to have this, so we're
  // adding it.
  // $FlowIgnore[prop-missing]
  Object.defineProperty(request, "aborted", {
    // We happen to know that this internal property exists.
    // $FlowIgnore[prop-missing]
    get: () => request._aborted
  });

  /**
   * We only add caching support if we were given a cache to use.
   * We also make sure that this request is something we want to cache.
   * We default to JS files only, but this can be overridden in the gateway
   * options.
   */
  if (options.cachePlugin && (0, _isCacheable.isCacheable)(url, options.isCacheable)) {
    /**
     * If we get here, we are caching this request.
     */
    return (0, _requestsFromCache.asCachedRequest)(options, request);
  }

  /**
   * We're not caching this request, so let's just not set caching up.
   */
  return (0, _requestsFromCache.asUncachedRequest)(request);
};
exports.makeRequest = makeRequest;
//# sourceMappingURL=make-request.js.map