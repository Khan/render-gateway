"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trace = void 0;

var traceAgent = _interopRequireWildcard(require("@google-cloud/trace-agent"));

var _getLogger = require("./get-logger.js");

var _traceImpl = require("./trace-impl.js");

var _safeHasOwnProperty = require("./safe-has-own-property.js");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const trace = (action, message, requestOrLogger) => {
  const tracer = traceAgent.get();

  if (requestOrLogger == null || (0, _safeHasOwnProperty.safeHasOwnProperty)(requestOrLogger, "url")) {
    const logger = (0, _getLogger.getLogger)(requestOrLogger);
    return (0, _traceImpl.traceImpl)(logger, action, message, tracer);
  }

  return (0, _traceImpl.traceImpl)(requestOrLogger, action, message, tracer);
};

exports.trace = trace;
//# sourceMappingURL=trace.js.map