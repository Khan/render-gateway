"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runServer = void 0;
var _express = _interopRequireDefault(require("express"));
var _expressAsyncHandler = _interopRequireDefault(require("express-async-handler"));
var _index = require("../shared/index.js");
var _index2 = require("../ka-shared/index.js");
var _makeCheckSecretMiddleware = require("./middleware/make-check-secret-middleware.js");
var _logRequestInfoMiddleware = require("./middleware/log-request-info-middleware.js");
var _makeRenderHandler = require("./handlers/make-render-handler.js");
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
    warmUpHandler,
    ...remainingOptions
  } = options;
  const {
    version
  } = (0, _index.getGatewayInfo)();
  const app = (0, _express.default)()
  /**
   * This sets up the /_api/ route handlers that are used by the KA
   * deployment system. Has to go before we check secrets.
   */.use((0, _index2.makeCommonServiceRouter)(version, warmUpHandler))
  /**
   * This adds a check that requests below this point are coming from
   * a known source.
   */.use(await (0, _makeCheckSecretMiddleware.makeCheckSecretMiddleware)(authentication))
  /**
   * After the secret check, we log info about the request. Since this
   * is logging, it MUST go after the secret check or we might leak a
   * secret, and we don't want that.
   */.use(_logRequestInfoMiddleware.logRequestInfoMiddleware)
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
  const runtimeMode = (0, _index2.getRuntimeMode)();
  const logLevel = (0, _index2.getLogLevel)();
  const gatewayOptions = {
    mode: runtimeMode,
    logger: (0, _index.createLogger)(runtimeMode, logLevel),
    ...remainingOptions
  };
  await (0, _index.startGateway)(gatewayOptions, app);
};
exports.runServer = runServer;
//# sourceMappingURL=run-server.js.map