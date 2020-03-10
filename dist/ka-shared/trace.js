"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trace = void 0;

var traceAgent = _interopRequireWildcard(require("@google-cloud/trace-agent"));

var _index = require("../shared/index.js");

var _getLogger = require("./get-logger.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Start tracing an event.
 *
 * This will log the start of a trace and open a trace session, which is
 * returned. Use the returned session to end the trace when the traced event is
 * over. The traced event will be logged and also written to the Google Cloud
 * StackDriver Trace agent.
 *
 * Note that if startTraceAgent was never called, this will still log but the
 * StackDriver trace span creation will not actually happen.
 *
 * @param {string} name The name of the event being traced.
 * @param {TReq: RequestWithLog<$Request>} [request] The request being
 * fulfilled. This is used to determine if a request-scoped logger can be used.
 * @returns {ITraceSession} The new trace session that was created and is to be
 * used to end the session.
 */
const trace = (name, request) => {
  const logger = (0, _getLogger.getLogger)(request);
  const tracer = traceAgent.get();
  return (0, _index.trace)(logger, name, tracer);
};

exports.trace = trace;
//# sourceMappingURL=trace.js.map