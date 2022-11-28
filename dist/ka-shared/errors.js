"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Errors = void 0;
var _index = require("../shared/index.js");
/**
 * @typedef {Object} Errors The different errors in our error taxononomy.
 * @extends SharedErrors
 *
 * @property {ErrorKind} TransientKhanService There was a problem when
 * contacting another Khan service that might be resolvable by retrying.
 *
 * @property {ErrorKind} KhanService There was a non-transient problem when
 * contacting another Khan service.
 */
/**
 * @type {Errors} A utility for referencing our error taxonomy.
 */
const Errors = Object.freeze({
  ..._index.Errors,
  TransientKhanService: "TransientKhanService",
  KhanService: "KhanService"
});
exports.Errors = Errors;
//# sourceMappingURL=errors.js.map