"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRequestLogger = void 0;

const getRequestLogger = (defaultLogger, request) => request != null && request.log != null ? request.log : defaultLogger;

exports.getRequestLogger = getRequestLogger;
//# sourceMappingURL=get-request-logger.js.map