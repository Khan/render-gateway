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
    host,
    port,
    name,
    mode,
    keepAliveTimeout
  } = options;
  /**
   * Make sure GAE_SERVICE has a value.
   *
   * If it isn't set at this point, we're not running in GAE, so we can
   * set it ourselves.
   */

  if (process.env.GAE_SERVICE == null) {
    process.env.GAE_SERVICE = name;
  }
  /**
   * In development mode, we include the heapdump module if it exists.
   * With this installed, `kill -USR2 <pid>` can be used to create a
   * heapsnapshot file of the gateway's memory.
   */


  if (mode === "development") {
    try {
      /* eslint-disable import/no-unassigned-import */
      // $FlowIgnore(May not be installed)
      require("heapdump");
      /* eslint-enable import/no-unassigned-import */


      logger.debug(`Heapdumps enabled. To create a heap snapshot at any time, run "kill -USR2 ${process.pid}".`);
    } catch (e) {// heapdump is an optional peer dependency, so if it is absent,
      // that is perfectly fine.
    }
  } // Set up stackdriver integrations.


  await (0, _setupStackdriver.setupStackdriver)(mode); // Add GAE middleware.

  const appWithMiddleware = await (0, _useAppEngineMiddleware.useAppEngineMiddleware)(app, mode, logger);
  /**
   * Start the gateway listening.
   *
   * We need the variable so we can reference it inside the error handling
   * callback. Feels a bit nasty, but it works.
   */

  const gateway = appWithMiddleware.listen(port, host, err => {
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
  /**
   * Utility method for gracefully shutting down the server.
   */

  const shutdown = () => {
    if (!gateway) {
      return;
    }

    logger.info("Gracefully shutting down server.");

    try {
      gateway.close(err => {
        if (err) {
          logger.error(`Error shutting down server: ${err && err.message || "Unknown Error"}`);
          process.exit(1);
        } else {
          process.exit(0);
        }
      });
    } catch (err) {
      logger.error(`Error closing gateway: ${err && err.message || "Unknown Error"}`);
      process.exit(1);
    }
  };
  /**
   * Check to see if there are ENV variables specified to limit the total
   * memory usage of a process. We look at the GAE_MEMORY_MB and MIN_FREE_MB
   * variables to compute out the maximum amount of memory this process
   * should be using. Then we compare it against what is actually being used
   * and if it's above that threshold we shutdown the server.
   */


  const {
    GAE_MEMORY_MB,
    MIN_FREE_MB
  } = process.env;

  if (GAE_MEMORY_MB && MIN_FREE_MB) {
    appWithMiddleware.use(() => {
      const gaeMemory = parseFloat(GAE_MEMORY_MB) * 1024 * 1024;
      const minFreeMemory = parseFloat(MIN_FREE_MB) * 1024 * 1024;
      const maxMemory = gaeMemory - minFreeMemory;
      const totalMemory = process.memoryUsage().rss; // We check to see if the total memory usage for this process is
      // higher than what's allowed and, if so, we shut it down gracefully

      if (totalMemory >= maxMemory) {
        logger.info(`Memory usage has gone over maximum. ` + `(used: ${totalMemory}), limit: ${maxMemory}`);
        shutdown();
      }
    });
  }
  /**
   * In this server is being run using a process manager, such as PM2, we
   * may be asked to shutdown gracefully. We do this be listening for the
   * SIGINT signal and then close the server. This prevents new connections
   * from coming in and waits until the existing connections complete before
   * the callback is fired. At which point we can safely shutdown the server.
   * If we fail to respond then the process manager may try to forcefully
   * shutdown the server after a timeout.
   */


  process.on("SIGINT", () => {
    logger.info("SIGINT received.");
    shutdown();
  });
  /**
   * NOTE(somewhatabstract): We have seen many 502 BAD GATEWAY errors in
   * production Node services. It seems this is because the Node server
   * is closing a connection before the load balancer is expecting it to.
   * There is some indication on the Internet [1] that the issue can occur
   * when Node's (or nginx [2]) keepalive is lower than the load balancer's
   * keepalive. In addition, the recommended fix is to always have the load
   * balancer close a connection by ensuring the Node server has a higher
   * keepalive timeout value than the load balancer.
   *
   * Node's default is 5s, but the indication is that the Google load
   * balancer value is 80s [3]. So, here we default to 90s, but we also
   * provide a configuration value to change it as needed.
   *
   * In addition, it is suggested that the headers timeout should be higher
   * than the keepalive timeout [1].
   *
   * [1] https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
   * [2] https://blog.percy.io/tuning-nginx-behind-google-cloud-platform-http-s-load-balancer-305982ddb340
   * [3] https://khanacademy.slack.com/archives/CJSE4TMQX/p1573252787333500
   */

  if (gateway != null) {
    gateway.keepAliveTimeout = keepAliveTimeout || 90000;
    /**
     * The Flow type for a Node server does not include headersTimeout.
     * However, if we don't do the following shenanigans, it puts an error
     * on the appWithMiddleware.listen call above instead of here, and that
     * just feels wrong. I tried a $FlowIgnore here, but that doesn't work,
     * it has to be surpressed above in that case.
     */

    const trickFlow = gateway;
    trickFlow.headersTimeout = gateway.keepAliveTimeout + 5000;
  }
}
//# sourceMappingURL=start-gateway.js.map