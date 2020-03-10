"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asCachedRequest = exports.asUncachedRequest = exports.isFromCache = exports.FROM_CACHE_PROP_NAME = void 0;

var _superagentCachePlugin = _interopRequireDefault(require("superagent-cache-plugin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
 * @param {SuperAgentRequest} request The request to be modified.
 * @param {boolean} buffer When true, the response body will be buffered,
 * otherwise it will not.
 * @returns {SuperAgentRequest} A superagent request supporting caching for the
 * given URL.
 */


exports.isFromCache = isFromCache;

const asUncachedRequest = (request, buffer) => request.buffer(buffer).then(res => {
  /**
   * There's no cache, so this is definitely not from cache.
   */
  res[FROM_CACHE_PROP_NAME] = false;
  return res;
});
/**
 * Turn unbuffered, uncached request into cached request with or without buffer.
 *
 * Could resolve from cache if caching is enabled and the request has already
 * been fulfilled once. Otherwise, this creates a new request for the URL.
 *
 * The request will resolve with an additional property to indicate if it was
 * resolved from cache or not.
 *
 * @param {SuperAgentRequest} request The request to be modified.
 * @param {CachingStrategy} strategy The strategy to control caching.
 * @param {boolean} buffer When true, the response body will be buffered,
 * otherwise it will not.
 * @returns {SuperAgentRequest} A superagent request supporting caching for the
 * given URL.
 */


exports.asUncachedRequest = asUncachedRequest;

const asCachedRequest = (request, strategy, buffer) => {
  const {
    provider,
    getExpiration
  } = strategy;
  const superagentCache = (0, _superagentCachePlugin.default)(provider);
  const NEW_CACHE_ENTRY = "NO";
  return request.use(superagentCache).expiration(getExpiration === null || getExpiration === void 0 ? void 0 : getExpiration(request.url)).prune((response, gutResponse) => {
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
    guttedResponse[FROM_CACHE_PROP_NAME] = NEW_CACHE_ENTRY;
    return guttedResponse;
  }).buffer(buffer).then(res => {
    /**
     * Set the _fromCache option to a boolean value.
     *
     * This works because if it was just cached, then the _fromCache
     * is set explicitly to "NO". If we just retrieved the response
     * from cache, then _fromCache would be true/false, and so
     * will not match our default.
     *
     * It also works because the response we get here is what is in
     * the cache so any modifications we make are reflected in the
     * cached value. Cheeky, but it works 😈
     */
    res[FROM_CACHE_PROP_NAME] = res[FROM_CACHE_PROP_NAME] !== NEW_CACHE_ENTRY;
    return res;
  });
};

exports.asCachedRequest = asCachedRequest;
//# sourceMappingURL=requests-from-cache.js.map