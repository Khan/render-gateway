"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLogger = void 0;

var _getRequestLogger = require("./get-request-logger.js");

var _rootLogger = require("./root-logger.js");

/**
 * Get the logger to use in the current context.
 *
 * When given a request, if that request has a log property, then that logger
 * is returned, otherwise the top-level logger instance is returned. This
 * provides a convenience so that the calling code does not need to know the
 * source of the logger.
 *
 * There is no need for things to knowingly request the top-level logger
 * as things that are logging should not care. However, in a case where there
 * is no request to use for context, it is equivalent to explicitly requesting
 * the top-level logger.
 */
const getLogger = request => {
  const rootLogger = (0, _rootLogger.getRootLogger)();
  return (0, _getRequestLogger.getRequestLogger)(rootLogger, request);
};

exports.getLogger = getLogger;
//# sourceMappingURL=get-logger.js.map