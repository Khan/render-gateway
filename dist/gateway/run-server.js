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

var _makeRenderHandler = require("./handlers/make-render-handler.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
    uncaughtRenderErrorHandler
  } = options,
        remainingOptions = _objectWithoutProperties(options, ["authentication", "renderEnvironment", "uncaughtRenderErrorHandler"]);

  const {
    version
  } = (0, _index.getGatewayInfo)();
  const app = (0, _express.default)().use(
  /**
   * This sets up the /_api/ route handlers that are used by the KA
   * deployment system.
   */
  (0, _index2.makeCommonServiceRouter)(version))
  /**
   * This adds a check that requests below this point are coming from
   * a known source.
   */
  .use((await (0, _makeCheckSecretMiddleware.makeCheckSecretMiddleware)(authentication)))
  /**
   * This is our render route. See the handler to learn how the magic
   * happens.
   */
  .get("/render", (0, _expressAsyncHandler.default)((0, _makeRenderHandler.makeRenderHandler)(renderEnvironment, uncaughtRenderErrorHandler)));
  /**
   * Added this to support forwarding proxies in case we need it, per the
   * documentation:
   *
   * https://cloud.google.com/appengine/docs/standard/nodejs/runtime#https_and_forwarding_proxies
   */

  app.set("trust proxy", true); // Start the gateway.

  const gatewayOptions = _objectSpread({
    mode: (0, _index2.getRuntimeMode)(),
    logger: (0, _index2.getLogger)()
  }, remainingOptions);

  (0, _index.startGateway)(gatewayOptions, app);
};

exports.runServer = runServer;
//# sourceMappingURL=run-server.js.map