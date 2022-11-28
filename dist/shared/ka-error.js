"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _extractError = require("./extract-error.js");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Error to be thrown and logged within KA code.
 *
 * This custom error supports error taxonomy.
 */
class KAError extends Error {
  /**
   * Construct a KAError instance.
   *
   * @param {string} message The error message.
   * @param {TKind} kind The kind of error.
   * @param {Error} [sourceError] The original error that spawned this one.
   */
  constructor(message, kind, sourceError = null) {
    super(message);

    // Set the name so we get a nice error output, like
    // KAInternalError
    _defineProperty(this, "kind", void 0);
    _defineProperty(this, "sourceError", void 0);
    this.name = `KA${kind}Error`;

    // The kind of error which could be used for categorization with
    // other error sources that use the same error taxonomy.
    this.kind = kind;

    // If there is a source error that we're wrapping, we also want to
    // unpack that and attach it for additional diagnostics.
    if (sourceError != null) {
      this.sourceError = (0, _extractError.extractError)(sourceError);
    }
  }
}
exports.default = KAError;
//# sourceMappingURL=ka-error.js.map