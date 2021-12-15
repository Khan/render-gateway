"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Errors = void 0;

var _index = require("../shared/index.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
const Errors = Object.freeze(_objectSpread(_objectSpread({}, _index.Errors), {}, {
  TransientKhanService: "TransientKhanService",
  KhanService: "KhanService"
}));
exports.Errors = Errors;
//# sourceMappingURL=errors.js.map