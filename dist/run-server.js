"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runServer = void 0;

var _express = _interopRequireDefault(require("express"));

var _index = require("./shared/index.js");

var _index2 = require("./ka-shared/index.js");

var _getRuntimeMode = require("./ka-shared/get-runtime-mode.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Run the render-gateway server using the provided options.
 */
const runServer = options => {
  // TODO: Do a real server.
  //   For now, we just handle all gets and return a response that is the
  //   url that was requested.
  const app = (0, _express.default)().use(
  /**
   * This sets up the /_api/ route handlers that are used by the KA
   * deployment system.
   */
  (0, _index2.makeCommonServiceRouter)(process.env.GAE_VERSION || "fake-dev-version")).get("/*", async (req, res) => {
    res.send(`The URL you requested was ${req.url}`);
  }); // Start the gateway.

  const gatewayOptions = _objectSpread({
    mode: (0, _getRuntimeMode.getRuntimeMode)(),
    logger: (0, _index2.getLogger)()
  }, options);

  (0, _index.startGateway)(gatewayOptions, app);
};

exports.runServer = runServer;
//# sourceMappingURL=run-server.js.map