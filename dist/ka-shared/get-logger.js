"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLogger = void 0;

var _index = require("../shared/index.js");

var _getRuntimeMode = require("./get-runtime-mode.js");

var _getLogLevel = require("./get-log-level.js");

/**
 * Create our top-level logger on module import so that all importers of this
 * file share the same logger.
 */
const rootLogger = (0, _index.createLogger)((0, _getRuntimeMode.getRuntimeMode)(), (0, _getLogLevel.getLogLevel)());
/**
 * Get the logger to use in the current context.
 *
 * When given a request, if that request has a log property, then that logger
 * is returned, otherwise the top-level logger instance is returned. This
 * provides a convenience so that the calling code does not need to know the
 * source of the logger.
 *
 * There is no need for a logger to specifically request the top-level logger
 * as things that are logging should not care. However, in a case where there
 * is no request to use for context, it is equivalent to explicitly requesting
 * the top-level logger. To put it another way, there is no need for a semantic
 * use of getTopLevelLogger as that is not a real use-case.
 */

const getLogger = request => (0, _index.getRequestLogger)(rootLogger, request);

exports.getLogger = getLogger;
//# sourceMappingURL=get-logger.js.map