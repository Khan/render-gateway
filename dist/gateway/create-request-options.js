"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRequestOptions = void 0;

var _superagentCachePlugin = _interopRequireDefault(require("superagent-cache-plugin"));

var _makeAgent = require("./make-agent.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const createRequestOptions = requestsOptions => {
  const defaultRequestOptions = {
    buffer: true,
    retries: 2,
    timeout: 60000
  };
  const {
    keepAlive,
    caching,
    retries,
    shouldRetry,
    timeout
  } = requestsOptions || {};
  const agent = (0, _makeAgent.makeAgent)(keepAlive);
  const cachePlugin = caching == null ? null : (0, _superagentCachePlugin.default)(caching.provider);
  const requestOptions = {
    agent,
    buffer: defaultRequestOptions.buffer,
    cachePlugin,
    retries: retries || defaultRequestOptions.retries,
    shouldRetry,
    timeout: timeout || defaultRequestOptions.timeout,
    getExpiration: caching === null || caching === void 0 ? void 0 : caching.getExpiration,
    isCacheable: caching === null || caching === void 0 ? void 0 : caching.isCacheable
  };
  return requestOptions;
};

exports.createRequestOptions = createRequestOptions;
//# sourceMappingURL=create-request-options.js.map