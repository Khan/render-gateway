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
 * The request will resolve with an additional _fromCache property, which will
 * indicate if it was resolved from cache or not.
 *
 * @param {RenderGatewayOptions} options The options used to start the gateway.
 * @param {string} url The URL to be requested.
 * @param {Logger} logger The logger to use.
 * @param {boolean} [buffer] Defaults to true. When true, the response body will
 * be buffered, otherwise it will not.
 * @returns {Promise<SuperAgentResponse>} A superagent request for the URL.
 */
const makeRequest = (options, url, logger, buffer = true) => {
  var _options$requests;

  /**
   * Create the base request with our various options.
   */
  const request = (0, _makeUnbufferedNoCacheRequest.makeUnbufferedNoCacheRequest)(options, url, logger);
  /**
   * We only add caching support if we were given a cache to use.
   * We also make sure that this request is something we want to cache.
   * We default to JS files only, but this can be overridden in the gateway
   * options.
   */

  const cacheOptions = (_options$requests = options.requests) === null || _options$requests === void 0 ? void 0 : _options$requests.caching;

  if (cacheOptions && (0, _isCacheable.isCacheable)(url, cacheOptions.isCacheable)) {
    /**
     * If we get here, we are caching this request.
     */
    return (0, _requestsFromCache.asCachedRequest)(request, cacheOptions, buffer);
  }
  /**
   * We're not caching this request, so let's just not set caching up.
   */


  return (0, _requestsFromCache.asUncachedRequest)(request, buffer);
};

exports.makeRequest = makeRequest;
//# sourceMappingURL=make-request.js.map