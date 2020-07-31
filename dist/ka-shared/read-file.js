"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readFile = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _util = require("util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Utilities for reading secrets from secrets files.
 */

/**
 * Read file.
 *
 * This is an abstraction that aids testing by providing a mockable function
 * call that is less likely to break test infrastructure (unlike mocking
 * the fs module).
 */
const readFile = (0, _util.promisify)(_fs.default.readFile);
exports.readFile = readFile;
//# sourceMappingURL=read-file.js.map