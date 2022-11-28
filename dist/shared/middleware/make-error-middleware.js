"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeErrorMiddleware = void 0;
var _expressWinston = _interopRequireDefault(require("express-winston"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Create middleware for reporting errors.
 */
const makeErrorMiddleware = logger =>
/**
 * Express-winston types aren't parameterized, so we suppress the error.
 */
_expressWinston.default.errorLogger({
  level: "error",
  winstonInstance: logger
});
exports.makeErrorMiddleware = makeErrorMiddleware;
//# sourceMappingURL=make-error-middleware.js.map