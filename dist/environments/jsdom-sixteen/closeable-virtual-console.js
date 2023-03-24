"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CloseableVirtualConsole = void 0;
var _jsdom = require("jsdom");
var _wonderStuffCore = require("@khanacademy/wonder-stuff-core");
var _extractError = require("../../extract-error.js");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class CloseableVirtualConsole extends _jsdom.VirtualConsole {
  constructor(logger) {
    super();
    _defineProperty(this, "_closed", void 0);
    _defineProperty(this, "close", () => {
      this._closed = true;
    });
    this._closed = false;
    this.on("jsdomError", e => {
      if (this._closed) {
        // We are closed. No logging.
        return;
      }
      if (e.message.indexOf("Could not load img") >= 0) {
        // We know that images cannot load. We're deliberately blocking
        // them.
        return;
      }
      const simplifiedError = (0, _extractError.extractError)(e);
      logger.error(`JSDOM jsdomError:${simplifiedError.error || ""}`, {
        ...simplifiedError,
        kind: _wonderStuffCore.Errors.Internal
      });
    });

    /**
     * NOTE(somewhatabstract): We pass args array as the metadata parameter for
     * winston log. We don't worry about adding the error kind here; we mark
     * these as Errors.Internal automatically if they don't already include a
     * kind.
     */
    this.on("error", (message, ...args) => !this._closed && logger.error(`JSDOM error:${message}`, {
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
      this.on(method, (message, ...args) => !this._closed && logger.silly(`JSDOM ${method}:${message}`, {
        args
      }));
    };
    passthruLog("warn");
    passthruLog("info");
    passthruLog("log");
    passthruLog("debug");
  }
}
exports.CloseableVirtualConsole = CloseableVirtualConsole;
//# sourceMappingURL=closeable-virtual-console.js.map