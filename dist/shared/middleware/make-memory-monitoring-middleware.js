"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeMemoryMonitoringMiddleware = void 0;

var _getRequestLogger = require("../get-request-logger.js");

var _shutdown = require("../shutdown.js");

/**
 * Check to see if there are ENV variables specified to limit the total
 * memory usage of a process. We look at the GAE_MEMORY_MB and MIN_FREE_MB
 * variables to compute out the maximum amount of memory this process
 * should be using. Then we compare it against what is actually being used
 * and if it's above that threshold we shutdown the server.
 */
const makeMemoryMonitoringMiddleware = rootlogger => {
  const {
    GAE_MEMORY_MB,
    MIN_FREE_MB
  } = process.env;
  rootlogger.info(`Creating memory monitoring middleware`, {
    GAE_MEMORY_MB,
    MIN_FREE_MB
  });

  const middleware = (req, res, next) => {
    const logger = (0, _getRequestLogger.getRequestLogger)(rootlogger, req);

    if (!GAE_MEMORY_MB || !MIN_FREE_MB) {
      logger.warn("Memory monitoring cannot be performed. Environment variables missing.");
      next();
      return;
    }

    const gaeLimitBytes = parseFloat(GAE_MEMORY_MB) * 1024 * 1024;
    const minFreeBytes = parseFloat(MIN_FREE_MB) * 1024 * 1024;
    const maxAllowedBytes = gaeLimitBytes - minFreeBytes;
    const totalUsageBytes = process.memoryUsage().rss;
    logger.info("Memory check", {
      gaeLimitBytes,
      minFreeBytes,
      maxAllowedBytes,
      totalUsageBytes
    }); // We check to see if the total memory usage for this process is
    // higher than what's allowed and, if so, we shut it down gracefully

    if (totalUsageBytes >= maxAllowedBytes) {
      logger.warn("Memory usage is exceeding maximum.", {
        totalUsageBytes,
        maxAllowedBytes
      });
      (0, _shutdown.shutdownGateway)(logger);
    }

    next();
  };

  return middleware;
};

exports.makeMemoryMonitoringMiddleware = makeMemoryMonitoringMiddleware;
//# sourceMappingURL=make-memory-monitoring-middleware.js.map