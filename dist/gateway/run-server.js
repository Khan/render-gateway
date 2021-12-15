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

const _excluded = ["authentication", "renderEnvironment", "uncaughtRenderErrorHandler", "defaultRenderErrorResponse", "warmUpHandler"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

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
    warmUpHandler
  } = options,
        remainingOptions = _objectWithoutProperties(options, _excluded);

  const {
    version
  } = (0, _index.getGatewayInfo)();
  const app = (0, _express.default)()
  /**
   * This sets up the /_api/ route handlers that are used by the KA
   * deployment system. Has to go before we check secrets.
   */
  .use((0, _index2.makeCommonServiceRouter)(version, warmUpHandler))
  /**
   * This adds a check that requests below this point are coming from
   * a known source.
   */
  .use(await (0, _makeCheckSecretMiddleware.makeCheckSecretMiddleware)(authentication))
  /**
   * After the secret check, we log info about the request. Since this
   * is logging, it MUST go after the secret check or we might leak a
   * secret, and we don't want that.
   */
  .use(_logRequestInfoMiddleware.logRequestInfoMiddleware)
  /**
   * This is our render route. See the handler to learn how the magic
   * happens.
   */
  .get("/_render", (0, _expressAsyncHandler.default)((0, _makeRenderHandler.makeRenderHandler)(renderEnvironment, uncaughtRenderErrorHandler, defaultRenderErrorResponse)));
  /**
   * Added this to support forwarding proxies in case we need it, per the
   * documentation:
   *
   * https://cloud.google.com/appengine/docs/standard/nodejs/runtime#https_and_forwarding_proxies
   */

  app.set("trust proxy", true); // Start the gateway.

  const runtimeMode = (0, _index2.getRuntimeMode)();
  const logLevel = (0, _index2.getLogLevel)();

  const gatewayOptions = _objectSpread({
    mode: runtimeMode,
    logger: (0, _index.createLogger)(runtimeMode, logLevel)
  }, remainingOptions);

  await (0, _index.startGateway)(gatewayOptions, app);
};

exports.runServer = runServer;
//# sourceMappingURL=run-server.js.map