"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeUnbufferedNoCacheRequest = void 0;

var _superagent = _interopRequireDefault(require("superagent"));

var _makeAgent = require("./make-agent.js");

var _makeShouldRetry = require("./make-should-retry.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Make a request for a given URL without buffering or caching.
 *
 * This is not intended for direct use. Use makeRequest.
 *
 * @param {RenderGatewayOptions} options The options used to start the gateway.
 * @param {string} url The URL to be requested.
 * @param {Logger} logger The logger to use.
 * @returns {SuperAgentRequest} A superagent request for the URL.
 */
const makeUnbufferedNoCacheRequest = (options, url, logger) => {
  const {
    name: gatewayName,
    requests: requestOptions
  } = options; // Get an agent.

  const agent = (0, _makeAgent.makeAgent)(requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.keepAlive); // Build our main fetcher using the configured agent.

  return _superagent.default.get(url).agent(agent)
  /**
   * Configure retries since superagent can handle this for us.
   * We give it a callback so we can log the retry and, if we so choose
   * in the future, decide whether we should allow any more. This would
   * allow us to short circuit the retry count (the max retries still
   * takes precedence over our callback response, so we can't retry
   * forever).
   */
  .retry((requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.retries) || 2, (0, _makeShouldRetry.makeShouldRetry)(logger, requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.shouldRetry))
  /**
   * We add a user agent header so that we can easily identify our
   * requests in logs.
   *
   * The header has a form like:
   *     gateway-name (GAE_VERSION_STRING_HERE)
   */
  .set("User-Agent", `${gatewayName} (${process.env.GAE_VERSION || "UNKNOWN"})`)
  /**
   * Our default timeout is 1 minute, but we allow for it to be
   * overridden by gateway options.
   */
  .timeout((requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeout) || 60000);
};

exports.makeUnbufferedNoCacheRequest = makeUnbufferedNoCacheRequest;
//# sourceMappingURL=make-unbuffered-no-cache-request.js.map