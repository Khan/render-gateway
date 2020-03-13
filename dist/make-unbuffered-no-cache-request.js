"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeUnbufferedNoCacheRequest = void 0;

var _superagent = _interopRequireDefault(require("superagent"));

var _makeShouldRetry = require("./make-should-retry.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Make a request for a given URL without buffering or caching.
 *
 * This is not intended for direct use. Use makeRequest.
 *
 * @param {RenderGatewayOptions} options The options used to start the gateway.
 * @param {Logger} logger The logger to use.
 * @param {string} url The URL to be requested.
 * @returns {SuperAgentRequest} A superagent request for the URL.
 */
const makeUnbufferedNoCacheRequest = (options, logger, url) => _superagent.default.get(url).agent(options.agent)
/**
 * Configure retries since superagent can handle this for us.
 * We give it a callback so we can log the retry and, if we so choose
 * in the future, decide whether we should allow any more. This would
 * allow us to short circuit the retry count (the max retries still
 * takes precedence over our callback response, so we can't retry
 * forever).
 */
.retry(options.retries, (0, _makeShouldRetry.makeShouldRetry)(logger, options.shouldRetry))
/**
 * We add a user agent header so that we can easily identify our
 * requests in logs.
 *
 * The header has a form like:
 *     GAE_SERVICE_STRING_HERE (GAE_VERSION_STRING_HERE)
 */
.set("User-Agent", `${process.env.GAE_SERVICE || "unnamed-render-gateway"} (${process.env.GAE_VERSION || "UNKNOWN"})`).timeout(options.timeout);

exports.makeUnbufferedNoCacheRequest = makeUnbufferedNoCacheRequest;
//# sourceMappingURL=make-unbuffered-no-cache-request.js.map