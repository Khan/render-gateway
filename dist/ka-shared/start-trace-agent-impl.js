"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startTraceAgent = void 0;
var traceAgent = _interopRequireWildcard(require("@google-cloud/trace-agent"));
var _getRuntimeMode = require("./get-runtime-mode.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// Start logging agent for Cloud Trace (https://cloud.google.com/trace/).
/**
 * Starts the Google Cloud Trace agent.
 *
 * This should be imported and executed before any other imports.
 */
const startTraceAgent = () => traceAgent.start({
  enabled: (0, _getRuntimeMode.getRuntimeMode)() === "production"
});
exports.startTraceAgent = startTraceAgent;
//# sourceMappingURL=start-trace-agent-impl.js.map