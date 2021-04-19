"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeShouldRetry = void 0;

var _index = require("../shared/index.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
      if (logger.defaultMeta != null) {
        logger.defaultMeta.retries += 1;
      } // We log at the lowest level as usually we don't care about this
      // as long as we ultimately succeed.


      logger.silly("Request failed. Might retry.", _objectSpread(_objectSpread({}, (0, _index.extractError)(err)), {}, {
        code: err.code,
        status: res === null || res === void 0 ? void 0 : res.status
      }));
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