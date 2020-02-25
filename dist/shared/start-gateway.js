"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startGateway = startGateway;

var _useAppEngineMiddleware = require("./use-app-engine-middleware.js");

var _setupStackdriver = require("./setup-stackdriver.js");

/**
 * Start a gateway application server.
 *
 * This takes a server application definition and attaches middleware before
 * listening on the appropriate port per the passed options.
 */
async function startGateway(options, app) {
  const {
    logger,
    port,
    name,
    mode
  } = options; // Set up stackdriver integrations.

  await (0, _setupStackdriver.setupStackdriver)(mode); // Add GAE middleware.

  const appWithMiddleware = await (0, _useAppEngineMiddleware.useAppEngineMiddleware)(app, mode, logger);
  /**
   * Start the gateway listening.
   *
   * We need the variable so we can reference it inside the error handling
   * callback. Feels a bit nasty, but it works.
   */

  const gateway = appWithMiddleware.listen(port, err => {
    if (gateway == null || err != null) {
      logger.error(`${name} appears not to have started: ${err && err.message || "Unknown error"}`);
      return;
    }

    const address = gateway.address();

    if (address == null || typeof address === "string") {
      logger.warn(`${name} may not have started properly: ${address}`);
      return;
    }

    const host = address.address;
    const port = address.port;
    logger.info(`${name} running at http://${host}:${port}`);
  });
}
//# sourceMappingURL=start-gateway.js.map