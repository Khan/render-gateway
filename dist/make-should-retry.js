"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeShouldRetry = void 0;
var _extractError = require("./extract-error.js");
/**
 * Create a shouldRetry callback for use with superagent's retry() method.
 *
 * @param {Logger} logger The logger that will record the retry.
 * @param {CallbackHandler} [override] A callback that might override the
 * default behavior.
 * @returns {CallbackHandler} A superagent callback handler to use with the
 * retry() function.
 */
const makeShouldRetry = (logger, override) => {
  return (err, res) => {
    /**
     * This method gets called even on successful responses; I presume in
     * case something about the response requires retrying. So, let's not
     * log that the request failed if we don't have an error object.
     */
    if (err != null) {
      // We log at the lowest level as usually we don't care about this
      // as long as we ultimately succeed.
      logger.silly("Request failed. Might retry.", {
        ...(0, _extractError.extractError)(err),
        code: err.code,
        status: res === null || res === void 0 ? void 0 : res.status
      });
    }

    /**
     * According to https://github.com/visionmedia/superagent/blob/0de12b299d5d5b5ec05cc43e18e853a95bffb25a/src/request-base.js#L181-L206
     *
     * Returning a non-boolean value causes superagent to do its default
     * behavior, which is:
     * - allow retry for all 500 errors except 501
     * - allow retry for err.code set to any:
     *      ['ECONNRESET', 'ETIMEDOUT', 'EADDRINFO', 'ESOCKETTIMEDOUT']
     * - allow retry if err.timeout is truthy and err.code is 'ECONNABORTED`
     * - allow retry if err.crossDomain is truthy
     */
    return override === null || override === void 0 ? void 0 : override(err, res);
  };
};
exports.makeShouldRetry = makeShouldRetry;
//# sourceMappingURL=make-should-retry.js.map