"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logRequestInfoMiddleware = logRequestInfoMiddleware;

var _index = require("../../shared/index.js");

/**
 * Simple middleware that logs some info about the incoming request.
 */
function logRequestInfoMiddleware(req, res, next) {
  (0, _index.getLogger)(req).debug(`Request received: ${req.url}`, {
    headers: req.headers,
    method: req.method,
    url: req.url
  });
  next();
}
//# sourceMappingURL=log-request-info-middleware.js.map