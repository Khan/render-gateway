"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRequestLogger = void 0;

const getRequestLogger = (defaultLogger, request) => {
  if (defaultLogger == null) {
    if (request == null || request.log == null) {
      throw new Error("No logs available");
    }

    return request.log;
  }

  return request != null && request.log != null ? request.log : defaultLogger;
};

exports.getRequestLogger = getRequestLogger;
//# sourceMappingURL=get-request-logger.js.map