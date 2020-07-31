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
  const virtualConsole = new _jsdom.VirtualConsole();
  virtualConsole.on("jsdomError", e => {
    if (e.message.indexOf("Could not load img") >= 0) {
      // We know that images cannot load. We're deliberately blocking
      // them.
      return;
    }

    const simplifiedError = (0, _index.extractError)(e);
    logger.error(`JSDOM:${simplifiedError.error || ""}`, _objectSpread(_objectSpread({}, simplifiedError), {}, {
      kind: _index2.Errors.Internal
    }));
  }); // NOTE: We pass args array as the metadata parameter for winston log.
  //       We don't worry about adding the error kind here; we mark these
  //       as Errors.Internal automatically if they don't already include a
  //       kind.

  virtualConsole.on("error", (message, ...args) => logger.error(`JSDOM:${message}`, {
    args
  }));
  virtualConsole.on("warn", (message, ...args) => logger.warn(`JSDOM:${message}`, {
    args
  }));
  virtualConsole.on("info", (message, ...args) => logger.info(`JSDOM:${message}`, {
    args
  }));
  virtualConsole.on("log", (message, ...args) =>
  /**
   * Winston uses log for a different, core thing, so let's map log to
   * info.
   */
  logger.info(`JSDOM:${message}`, {
    args
  }));
  virtualConsole.on("debug", (message, ...args) => logger.debug(`JSDOM:${message}`, {
    args
  }));
  return virtualConsole;
};

exports.createVirtualConsole = createVirtualConsole;
//# sourceMappingURL=create-virtual-console.js.map