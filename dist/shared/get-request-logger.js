"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRequestLogger = void 0;

var _kaError = _interopRequireDefault(require("./ka-error.js"));

var _errors = require("./errors.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getRequestLogger = (defaultLogger, request) => {
  if (defaultLogger == null) {
    if (request == null || request.log == null) {
      throw new _kaError.default("No logs available", _errors.Errors.Internal);
    }

    return request.log;
  }

  return request != null && request.log != null ? request.log : defaultLogger;
};

exports.getRequestLogger = getRequestLogger;
//# sourceMappingURL=get-request-logger.js.map