"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "createRequestOptions", {
  enumerable: true,
  get: function () {
    return _createRequestOptions.createRequestOptions;
  }
});
exports.request = exports.abortInFlightRequests = void 0;

var _makeRequest = require("./make-request.js");

var _requestsFromCache = require("./requests-from-cache.js");

var _index = require("../ka-shared/index.js");

var _createRequestOptions = require("./create-request-options.js");

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


exports.abortInFlightRequests = abortInFlightRequests;

const request = (options, logger, url) => {
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


  const traceSession = (0, _index.trace)(`REQ: ${url}`, logger);
  const abortableRequest = (0, _makeRequest.makeRequest)(options, logger, url);
  const abortFn = abortableRequest.abort;
  /**
   * Now, let's do the infrastructure bits for tracing this request with
   * some useful logging data and removing completed requests from our
   * in flight list.
   */

  const traceInfo = {};
  const finalizedPromise = abortableRequest.then(res => {
    traceInfo.fromCache = (0, _requestsFromCache.isFromCache)(res);
    traceInfo.successful = true;
    return res;
  }).finally(() => {
    delete inFlightRequests[url];
    traceSession.end(traceInfo);
  });
  /**
   * Finally, we need to turn the promise back into an abortable and add it
   * to our list of in flight requests.
   */

  const finalizedRequest = finalizedPromise;
  finalizedRequest.abort = abortFn;
  inFlightRequests[url] = finalizedRequest;
  return finalizedRequest;
};

exports.request = request;
//# sourceMappingURL=request.js.map