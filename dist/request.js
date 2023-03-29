"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = exports.DefaultRequestOptions = void 0;
var _wonderStuffServer = require("@khanacademy/wonder-stuff-server");
var _makeRequest = require("./make-request.js");
var _requestsFromCache = require("./requests-from-cache.js");
var _extractError = require("./extract-error.js");
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
  let retryCount = 0;
  const retryTracker = (err, res) => {
    var _options$shouldRetry;
    if (err != null) {
      // Only update the count on errors.
      // This gets called even for successful requests.
      retryCount++;
    }
    return options === null || options === void 0 ? void 0 : (_options$shouldRetry = options.shouldRetry) === null || _options$shouldRetry === void 0 ? void 0 : _options$shouldRetry.call(options, err, res);
  };
  const optionsToUse = {
    ...DefaultRequestOptions,
    ...options,
    shouldRetry: retryTracker
  };
  const requestLogger = logger.child({
    url
  });

  /**
   * We don't already have this request in flight, so let's make a new
   * request.
   *
   * First, we start a trace.
   * Then we make the request.
   * Then we capture the abort function so we can reattach it later.
   */
  const traceSession = (0, _wonderStuffServer.trace)(`request`, url, requestLogger);
  traceSession.addLabel("url", url);
  const abortableRequest = (0, _makeRequest.makeRequest)(optionsToUse, requestLogger, url);

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
  }).catch(e => {
    // Let's log why this request failed since JSDOM may not share that
    // info with us.
    requestLogger.error("Request failed", (0, _extractError.extractError)(e));
    throw e;
  }).finally(() => {
    traceSession.addLabel("retries", retryCount);
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