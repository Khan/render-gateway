"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asCachedRequest = exports.asUncachedRequest = exports.getResponseSource = exports.CACHE_ID_PROP_NAME = void 0;

var _index = require("../shared/index.js");

var _index2 = require("../ka-shared/index.js");

/**
 * This is the name of the property we attach to responses so that we can
 * indicate if a response was from the cache or not.
 */
const CACHE_ID_PROP_NAME = "_cacheID";
/**
 * Determine the source of a superagent response.
 *
 * @param {SuperAgentResponse} response The response to check.
 * @param {string} cacheID The cacheID for items that are freshly added to the
 * cache in the current request.
 * @returns {ResponseSource} "cache" if the response was from cache,
 * "new request" if it was not from cache, or "unknown" if a cache state cannot
 * be determined.
 */

exports.CACHE_ID_PROP_NAME = CACHE_ID_PROP_NAME;

const getResponseSource = (response, cacheID) => {
  // We know that the response doesn't define this prop.
  // $FlowIgnore[prop-missing]
  const responseCacheID = response[CACHE_ID_PROP_NAME]; // If the cacheID to compare or the cache ID of the response are nully,
  // then we have no idea about the cache state.

  if (cacheID == null || responseCacheID == null) {
    return "unknown";
  } // If the response cacheID and the passed in cacheID are the same, then
  // we assume that the response was cached during the current request and
  // therefore, it was not taken from the existing cache.


  return responseCacheID === cacheID ? "new request" : "cache";
};
/**
 * Turn unbuffered, uncached request into uncached request with buffer.
 *
 * The request will resolve with an additional property to indicate if it was
 * resolved from cache or not.
 *
 * @param {Request} request The request to be modified.
 * @returns {Promise<Response>} A superagent request supporting caching for the
 * given URL.
 */


exports.getResponseSource = getResponseSource;

const asUncachedRequest = request => {
  /**
   * We just return the superagent request. It is already abortable.
   */
  const superagentRequest = request.buffer(true);
  return superagentRequest;
};
/**
 * Turn unbuffered, uncached request into cached request with or without buffer.
 *
 * Could resolve from cache if caching is enabled and the request has already
 * been fulfilled once. Otherwise, this creates a new request for the URL.
 *
 * The request will resolve with an additional property to indicate if it was
 * resolved from cache or not.
 *
 * @param {RequestOptions} options Used to determine caching setup and whether
 * the request should be buffered or not.
 * @param {Request} request The request to be modified.
 * @returns {Promise<Response>} A superagent request supporting caching for the
 * given URL.
 */


exports.asUncachedRequest = asUncachedRequest;

const asCachedRequest = (options, request) => {
  const {
    cachePlugin,
    getExpiration
  } = options;

  if (cachePlugin == null) {
    throw new _index.KAError("Cannot cache request without cache plugin instance.", _index2.Errors.NotAllowed);
  }
  /**
   * We need to ensure that what we return has the `abort` method still so
   * that we can let things like JSDOM call abort on promises.
   */


  const superagentRequest = request.use(cachePlugin).expiration(getExpiration === null || getExpiration === void 0 ? void 0 : getExpiration(request.url)).prune((response, gutResponse) => {
    var _options$getCacheID;

    /**
     * This is called to prune a response before it goes into the
     * cache.
     *
     * We want to use our own `prune` method so that we can track
     * what comes from cache versus what doesn't.
     *
     * But we still do the same thing that superagent-cache would
     * do, for now.
     */
    const guttedResponse = gutResponse(response);
    const cacheID = (_options$getCacheID = options.getCacheID) === null || _options$getCacheID === void 0 ? void 0 : _options$getCacheID.call(options);

    if (cacheID != null) {
      guttedResponse[CACHE_ID_PROP_NAME] = cacheID;
    }

    return guttedResponse;
  }).buffer(true); // We know this is abortable.

  return superagentRequest;
};

exports.asCachedRequest = asCachedRequest;
//# sourceMappingURL=requests-from-cache.js.map