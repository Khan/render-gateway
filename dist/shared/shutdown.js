"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shutdownGateway = exports.gatewayStarted = void 0;

var _extractError = require("./extract-error.js");

let startedGateway = null;
/**
 * Register the started gateway.
 *
 * This sets the started gateway so that it can be shutdown when
 * `shutdownGateway` is invoked.
 */

const gatewayStarted = gateway => {
  if (startedGateway != null) {
    throw new Error("Gateway already started.");
  }

  startedGateway = gateway;
};
/**
 * Shutdown the running gateway process.
 *
 * This closes any started express server and exits the process.
 * This must be written such that errors don't need to be handled by calling
 * code.
 */


exports.gatewayStarted = gatewayStarted;

const shutdownGateway = logger => new Promise((resolve, reject) => {
  if (startedGateway == null) {
    resolve();
    return;
  }

  logger.debug("Closing gateway."); // We notify the process manager that we're about to go offline
  // so that it stops sending us new requests.

  if (process.send) {
    process.send("offline");
  }

  startedGateway.close(err => {
    if (err) {
      const simplifiedError = (0, _extractError.extractError)(err);

      if (simplifiedError.error && simplifiedError.error.includes("ERR_SERVER_NOT_RUNNING")) {
        logger.info("Gateway already closed.", () => resolve());
      } else {
        logger.error("Error closing gateway", simplifiedError, () => reject());
      }
    } else {
      logger.info("Gateway closed. Shutting down process.", () => resolve());
    }
  }); // If the server hasn't shutdown in 20s then we log some details so
  // that we're aware that this is happening.

  setTimeout(() => {
    logger.warn("Server failed to close after 20s.");
  }, 15000);
}).then(() => process.exit(0)).catch(() => process.exit(1));

exports.shutdownGateway = shutdownGateway;
//# sourceMappingURL=shutdown.js.map