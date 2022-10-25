"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLogLevel = void 0;

/**
 * Determine the level at which to log.
 *
 * This will use the value of the KA_LOG_LEVEL environment variable, if
 * available; otherwise, defaults to "debug".
 */
const getLogLevel = () => {
  const maybeLogLevel = process.env.KA_LOG_LEVEL;
  switch (maybeLogLevel) {
    case "silly":
    case "debug":
    case "verbose":
    case "info":
    case "warn":
    case "error":
      return maybeLogLevel;
    default:
      return "debug";
  }
};
exports.getLogLevel = getLogLevel;
//# sourceMappingURL=get-log-level.js.map