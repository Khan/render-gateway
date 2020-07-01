"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createVirtualConsole = void 0;

var _jsdom = require("jsdom15");

var _index = require("../../../shared/index.js");

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
    logger.error(`JSDOM:${simplifiedError.error || ""}`, simplifiedError);
  }); // NOTE: We pass args array as the metadata parameter for winston log.

  virtualConsole.on("error", (message, ...args) => logger.error(`JSDOM:${message}`, args));
  virtualConsole.on("warn", (message, ...args) => logger.warn(`JSDOM:${message}`, args));
  virtualConsole.on("info", (message, ...args) => logger.info(`JSDOM:${message}`, args));
  virtualConsole.on("log", (message, ...args) =>
  /**
   * Winston uses log for a different, core thing, so let's map log to
   * info.
   */
  logger.info(`JSDOM:${message}`, args));
  virtualConsole.on("debug", (message, ...args) => logger.debug(`JSDOM:${message}`, args));
  return virtualConsole;
};

exports.createVirtualConsole = createVirtualConsole;
//# sourceMappingURL=create-virtual-console.js.map