"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runServer = void 0;
var _wonderStuffServer = require("@khanacademy/wonder-stuff-server");
var _express = _interopRequireDefault(require("express"));
var _expressAsyncHandler = _interopRequireDefault(require("express-async-handler"));
var _getLogLevel = require("./get-log-level.js");
var _makeRenderHandler = require("./handlers/make-render-handler.js");
var _getRequestAuthentication = require("./get-request-authentication.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Run the render-gateway server using the provided options.
 *
 * @param {RenderGatewayOptions} options The options that define how the
 * render gateway will operate.
 * @returns {Promise<void>} The promise of working.
 */
const runServer = async options => {
  const {
    authentication,
    renderEnvironment,
    uncaughtRenderErrorHandler,
    defaultRenderErrorResponse,
    host,
    port,
    cloudOptions,
    keepAliveTimeout,
    name
  } = options;
  if (process.env.NODE_ENV !== (0, _wonderStuffServer.getRuntimeMode)()) {
    process.env.NODE_ENV = process.env.KA_IS_DEV_SERVER === "1" ? "development" : "production";
  }
  const app = (0, _express.default)()
  /**
   * This is our render route. See the handler to learn how the magic
   * happens.
   */.get("/_render", (0, _expressAsyncHandler.default)((0, _makeRenderHandler.makeRenderHandler)(renderEnvironment, uncaughtRenderErrorHandler, defaultRenderErrorResponse)));

  /**
   * Added this to support forwarding proxies in case we need it, per the
   * documentation:
   *
   * https://cloud.google.com/appengine/docs/standard/nodejs/runtime#https_and_forwarding_proxies
   */
  app.set("trust proxy", true);

  // Start the gateway.
  await (0, _wonderStuffServer.startServer)({
    mode: (0, _wonderStuffServer.getRuntimeMode)(),
    logLevel: (0, _getLogLevel.getLogLevel)(),
    host,
    port,
    keepAliveTimeout,
    name,
    integrations: {
      profiler: cloudOptions === null || cloudOptions === void 0 ? void 0 : cloudOptions.profiler
    },
    requestAuthentication: await (0, _getRequestAuthentication.getRequestAuthentication)(authentication),
    allowHeapDumps: process.env.KA_ALLOW_HEAPDUMP === "1"
  }, app);
};
exports.runServer = runServer;
//# sourceMappingURL=run-server.js.map