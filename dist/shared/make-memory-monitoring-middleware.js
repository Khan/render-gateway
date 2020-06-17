"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeMemoryMonitoringMiddleware = void 0;

var _getLogger = require("../ka-shared/get-logger.js");

var _shutdown = require("./shutdown.js");

/**
 * Check to see if there are ENV variables specified to limit the total
 * memory usage of a process. We look at the GAE_MEMORY_MB and MIN_FREE_MB
 * variables to compute out the maximum amount of memory this process
 * should be using. Then we compare it against what is actually being used
 * and if it's above that threshold we shutdown the server.
 */
const makeMemoryMonitoringMiddleware = (server, logger) => {
  const {
    GAE_MEMORY_MB,
    MIN_FREE_MB
  } = process.env;
  logger.info(`GAE_MEMORY_MB: ${GAE_MEMORY_MB}`);
  logger.info(`MIN_FREE_MB: ${MIN_FREE_MB}`);
  return (req, res, next) => {
    const logger = (0, _getLogger.getLogger)(req);
    logger.info("INSIDE MIDDLEWARE");

    if (!GAE_MEMORY_MB || !MIN_FREE_MB) {
      logger.info("ENVs DON'T EXIST");
      return next();
    }

    logger.info("USING MIDDLEWARE");
    const gaeMemory = parseFloat(GAE_MEMORY_MB) * 1024 * 1024;
    const minFreeMemory = parseFloat(MIN_FREE_MB) * 1024 * 1024;
    const maxMemory = gaeMemory - minFreeMemory;
    const totalMemory = process.memoryUsage().rss;
    logger.info(`gaeMemory: ${gaeMemory}, minFreeMemory: ${minFreeMemory}, maxMemory: ${maxMemory}, totalMemory: ${totalMemory}`); // We check to see if the total memory usage for this process is
    // higher than what's allowed and, if so, we shut it down gracefully

    if (totalMemory >= maxMemory) {
      logger.info(`Memory usage has gone over maximum. ` + `(used: ${totalMemory}), limit: ${maxMemory}`);
      logger.info(`Memory usage has gone over maximum. ` + `(used: ${totalMemory}), limit: ${maxMemory}`);
      (0, _shutdown.shutdown)(server, logger);
    } else {
      logger.info(`Memory usage has NOT gone over maximum. ` + `(used: ${totalMemory}), limit: ${maxMemory}`);
    }

    next();
  };
};

exports.makeMemoryMonitoringMiddleware = makeMemoryMonitoringMiddleware;
//# sourceMappingURL=make-memory-monitoring-middleware.js.map