"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logRequestInfoMiddleware = logRequestInfoMiddleware;

var _index = require("../../shared/index.js");

/**
 * Simple middleware that logs some info about the incoming request.
 *
 * We log both at the info and debug levels. The info log line doesn't
 * include the headers since they give us problems with exporting our
 * info logs to bigquery. The issue is that we end up with a bigquery
 * column per unique header name, and so we run out of columns.
 */
function logRequestInfoMiddleware(req, res, next) {
  const logger = (0, _index.getLogger)(req);
  logger.info(`Request received: ${req.url}`, {
    method: req.method,
    url: req.url
  });
  logger.debug(`Request received: ${req.url}`, {
    headers: req.headers,
    method: req.method,
    url: req.url
  });
  next();
}
//# sourceMappingURL=log-request-info-middleware.js.map