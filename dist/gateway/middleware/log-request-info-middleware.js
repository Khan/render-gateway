"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logRequestInfoMiddleware = logRequestInfoMiddleware;
var _index = require("../../shared/index.js");

/**
 * Simple middleware that logs some info about the incoming request.
 *
 * We flatten the headers since they give us problems with exporting
 * our info logs to bigquery if we don't. The issue is that we end up
 * with a bigquery column per unique header name, and so we run out of
 * columns.
 */
function logRequestInfoMiddleware(req, res, next) {
  const flattenedHeaders = Object.keys(req.headers).reduce((headers, key) => headers + `${key}: ${req.headers[key]}\n`, "");
  (0, _index.getLogger)(req).info(`Request received: ${req.url}`, {
    allHeaders: flattenedHeaders,
    method: req.method,
    url: req.url
  });
  next();
}
//# sourceMappingURL=log-request-info-middleware.js.map