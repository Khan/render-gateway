"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createVirtualConsole = void 0;

var _jsdom = require("jsdom");

var _index = require("../../../shared/index.js");

var _index2 = require("../../../ka-shared/index.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Create a virtual console for use with JSDOM.
 *
 * @param {Logger} logger The logger to which this virtual console logs.
 * @returns {VirtualConsole} A JSDOM VirtualConsole instance.
 */
const createVirtualConsole = logger => {
  let closed = false;
  const virtualConsole = new _jsdom.VirtualConsole(); // We know virtual console doesn't have a close. We're adding it.
  // $FlowIgnore[prop-missing]

  virtualConsole.close = () => closed = true;

  virtualConsole.on("jsdomError", e => {
    if (closed) {
      // We are closed. No logging.
      return;
    }

    if (e.message.indexOf("Could not load img") >= 0) {
      // We know that images cannot load. We're deliberately blocking
      // them.
      return;
    }

    const simplifiedError = (0, _index.extractError)(e);
    logger.error(`JSDOM jsdomError:${simplifiedError.error || ""}`, _objectSpread(_objectSpread({}, simplifiedError), {}, {
      kind: _index2.Errors.Internal
    }));
  });
  /**
   * NOTE(somewhatabstract): We pass args array as the metadata parameter for
   * winston log. We don't worry about adding the error kind here; we mark
   * these as Errors.Internal automatically if they don't already include a
   * kind.
   */

  virtualConsole.on("error", (message, ...args) => !closed && logger.error(`JSDOM error:${message}`, {
    args
  }));
  /**
   * We log all other things as `silly`, since they are generally only useful
   * to us when we're developing/debugging issues locally, and not in
   * production. We could add some way to turn this on in production
   * temporarily (like a temporary "elevate log level" query param) if
   * we find that will be useful, but I haven't encountered an issue that
   * needed these in production yet; they're just noise.
   */

  const passthruLog = method => {
    !closed && virtualConsole.on(method, (message, ...args) => logger.silly(`JSDOM ${method}:${message}`, {
      args
    }));
  };

  passthruLog("warn");
  passthruLog("info");
  passthruLog("log");
  passthruLog("debug"); // We have made this into a real closeable virtual console.

  return virtualConsole;
};

exports.createVirtualConsole = createVirtualConsole;
//# sourceMappingURL=create-virtual-console.js.map