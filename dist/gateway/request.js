"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = exports.DefaultRequestOptions = exports.abortInFlightRequests = void 0;

var _makeRequest = require("./make-request.js");

var _requestsFromCache = require("./requests-from-cache.js");

var _index = require("../ka-shared/index.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * This tracks our inflight requests.
 */
const inFlightRequests = {};
/**
 * Abort any requests that are inflight and clear the inflight request queue.
 */

const abortInFlightRequests = () => {
  for (const url of Object.keys(inFlightRequests)) {
    const request = inFlightRequests[url];
    delete inFlightRequests[url];
    request.abort();
  }
};
/**
 * The defaults used for request options.
 */


exports.abortInFlightRequests = abortInFlightRequests;
const DefaultRequestOptions = {
  buffer: true,
  retries: 2,
  timeout: 60000
};
/**
 * Request a URL.
 *
 * Unlike makeRequest, which makes a new request, this will track inflight
 * requests and if there is one for the request being made, return that instead
 * of making a new one.
 *
 * NOTE: The AbortablePromise is only shallowly abortable. If any standard
 * promise methods are called on this, the promise they return no longer will
 * have the abort function. Therefore, you'll need to readd it.
 */

exports.DefaultRequestOptions = DefaultRequestOptions;

const request = (logger, url, options) => {
  const optionsToUse = _objectSpread({}, DefaultRequestOptions, {}, options);
  /**
   * Something may have already started this request. If it is already
   * "in flight", let's use it rather than making a whole new one.
   */


  const inFlight = inFlightRequests[url];

  if (inFlight != null) {
    return inFlight;
  }
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
    traceSession.addLabel("fromCache", (0, _requestsFromCache.isFromCache)(res));
    traceSession.addLabel("successful", true);
    return res;
  }).finally(() => {
    delete inFlightRequests[url];
    traceSession.end();
  });
  /**
   * Finally, we need to turn the promise back into an abortable and add it
   * to our list of in flight requests.
   */

  const finalizedRequest = finalizedPromise;
  /**
   * In tests, we might mock the promise API to return the same mock, so
   * to avoid cyclic abort calls, we only add abort if we're not the same
   * object.
   */

  if (finalizedRequest !== abortableRequest) {
    finalizedRequest.abort = () => abortableRequest.abort();
  }

  inFlightRequests[url] = finalizedRequest;
  return finalizedRequest;
};

exports.request = request;
//# sourceMappingURL=request.js.map