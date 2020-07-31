"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asCachedRequest = exports.asUncachedRequest = exports.isFromCache = exports.FROM_CACHE_PROP_NAME = void 0;

var _index = require("../shared/index.js");

var _index2 = require("../ka-shared/index.js");

/**
 * This is the name of the property we attach to responses so that we can
 * indicate if a response was from the cache or not.
 */
const FROM_CACHE_PROP_NAME = "_fromCache";
/**
 * Determine if a superagent response was from the cache or not.
 *
 * @param {SuperAgentResponse} response The response to check.
 * @returns {boolean} true if the response was from cache; otherwise false.
 */

exports.FROM_CACHE_PROP_NAME = FROM_CACHE_PROP_NAME;

const isFromCache = response => response[FROM_CACHE_PROP_NAME] === true;
/**
 * Turn unbuffered, uncached request into uncached request with or without
 * buffer.
 *
 * The request will resolve with an additional property to indicate if it was
 * resolved from cache or not.
 *
 * @param {RequestOptions} options Used to determine if the request should
 * buffer or not.
 * @param {Request} request The request to be modified.
 * @returns {Promise<Response>} A superagent request supporting caching for the
 * given URL.
 */


exports.isFromCache = isFromCache;

const asUncachedRequest = (options, request) => {
  /**
   * We need to ensure that what we return has the `abort` method still so
   * that we can let things like JSDOM call abort on promises.
   */
  const superagentRequest = request.buffer(true);
  const responsePromise = superagentRequest.then(res => {
    /**
     * There's no cache, so this is definitely not from cache.
     */
    res[FROM_CACHE_PROP_NAME] = false;
    return res;
  });
  const abortableResponse = responsePromise;

  abortableResponse.abort = () => superagentRequest.abort();

  return abortableResponse;
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
   * TODO(somewhatabstract, WEB-2722): Replace this with the requestID of the
   * render request. This will then work properly for both in-memory and other
   * cache types.
   */


  const FRESHLY_PRUNED = "PRUNED";
  /**
   * We need to ensure that what we return has the `abort` method still so
   * that we can let things like JSDOM call abort on promises.
   */

  const superagentRequest = request.use(cachePlugin).expiration(getExpiration === null || getExpiration === void 0 ? void 0 : getExpiration(request.url)).prune((response, gutResponse) => {
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
    guttedResponse[FROM_CACHE_PROP_NAME] = FRESHLY_PRUNED;
    return guttedResponse;
  }).buffer(true);
  const responsePromise = superagentRequest.then(res => {
    /**
     * Set the FROM_CACHE_PROP_NAME property to a boolean value.
     *
     * This works because if it is a brand new response that was just
     * cached, then the FROM_CACHE_PROP_NAME property is set explicitly
     * to FRESHLY_PRUNED. Therefore, we know it was not
     * previously cached. So, we set FROM_CACHE_PROP_NAME property to
     * false.
     *
     * The response we get here is what is in the cache so any
     * modifications we make are reflected in the cached value (this is
     * only true for in-memory cache).
     *
     * That means that if we get here and the FROM_CACHE_PROP_NAME is
     * not equal to FRESHLY_PRUNED, it MUST have come from the
     * cache and not a brand new request, so we can set the
     * FROM_CACHE_PROP_NAME property to true!
     *
     * Cheeky, but it works 😈
     */
    res[FROM_CACHE_PROP_NAME] = res[FROM_CACHE_PROP_NAME] !== FRESHLY_PRUNED;
    return res;
  });
  const abortableResponse = responsePromise;

  abortableResponse.abort = () => superagentRequest.abort();

  return abortableResponse;
};

exports.asCachedRequest = asCachedRequest;
//# sourceMappingURL=requests-from-cache.js.map