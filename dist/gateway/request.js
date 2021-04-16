"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = exports.DefaultRequestOptions = void 0;

var _makeRequest = require("./make-request.js");

var _requestsFromCache = require("./requests-from-cache.js");

var _index = require("../shared/index.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * The defaults used for request options.
 */
const DefaultRequestOptions = {
  retries: 2,
  timeout: 60000
};
/**
 * Request a URL.
 *
 * NOTE: The AbortablePromise is only shallowly abortable. If any standard
 * promise methods are called on this, the promise they return no longer will
 * have the abort function. Therefore, you'll need to readd it.
 */

exports.DefaultRequestOptions = DefaultRequestOptions;

const request = (logger, url, options) => {
  const optionsToUse = _objectSpread(_objectSpread({}, DefaultRequestOptions), options);
  /**
   * We don't already have this request in flight, so let's make a new
   * request.
   *
   * First, we start a trace.
   * Then we make the request.
   * Then we capture the abort function so we can reattach it later.
   */


  const traceSession = (0, _index.trace)(`request`, url, logger);
  traceSession.addLabel("url", url);
  const abortableRequest = (0, _makeRequest.makeRequest)(optionsToUse, logger, url);
  /**
   * Now, let's do the infrastructure bits for tracing this request with
   * some useful logging data and removing completed requests from our
   * in flight list.
   */

  const finalizedPromise = abortableRequest.then(res => {
    var _options$getCacheID;

    const currentRequestCacheID = options === null || options === void 0 ? void 0 : (_options$getCacheID = options.getCacheID) === null || _options$getCacheID === void 0 ? void 0 : _options$getCacheID.call(options);
    traceSession.addLabel("source", (0, _requestsFromCache.getResponseSource)(res, currentRequestCacheID));
    traceSession.addLabel("successful", true);
    return res;
  }).finally(() => {
    traceSession.end();
  });
  /**
   * Finally, we need to turn the promise back into an abortable and add it
   * to our list of in flight requests.
   */

  const finalizedRequest = finalizedPromise;

  finalizedRequest.abort = () => abortableRequest.abort();

  Object.defineProperty(finalizedRequest, "aborted", {
    get: () => abortableRequest.aborted
  });
  return finalizedRequest;
};

exports.request = request;
//# sourceMappingURL=request.js.map