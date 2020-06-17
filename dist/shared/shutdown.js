"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shutdown = void 0;

/**
 * Utility method for gracefully shutting down the server.
 */
const shutdown = (server, logger) => {
  logger.info("Gracefully shutting down server.");

  try {
    server.close(err => {
      if (err) {
        logger.error(`Error shutting down server: ${err && err.message || "Unknown Error"}`);
        process.exit(1);
      } else {
        process.exit(0);
      }
    });
  } catch (err) {
    logger.error(`Error closing server: ${err && err.message || "Unknown Error"}`);
    process.exit(1);
  }
};

exports.shutdown = shutdown;
//# sourceMappingURL=shutdown.js.map