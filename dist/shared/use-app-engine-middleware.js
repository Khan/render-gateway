"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAppEngineMiddleware = useAppEngineMiddleware;

var _express = _interopRequireDefault(require("express"));

var _expressAsyncHandler = _interopRequireDefault(require("express-async-handler"));

var _makeErrorMiddleware = require("./middleware/make-error-middleware.js");

var _makeRequestMiddleware = require("./middleware/make-request-middleware.js");

var _makeAppEngineRequestIdMiddleware = require("./middleware/make-app-engine-request-id-middleware.js");

var _makeMemoryMonitoringMiddleware = require("./middleware/make-memory-monitoring-middleware.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Apply the middleware that we want to use with Google App Engine (GAE).
 */
async function useAppEngineMiddleware(app, mode, logger) {
  return (0, _express.default)() // Add the request logging middleware.
  .use(await (0, _makeRequestMiddleware.makeRequestMiddleware)(mode, logger)) // Add requestID middleware.
  .use((0, _makeAppEngineRequestIdMiddleware.makeAppEngineRequestIDMiddleware)(logger)) // Add memory monitoring.
  .use((0, _expressAsyncHandler.default)((0, _makeMemoryMonitoringMiddleware.makeMemoryMonitoringMiddleware)(logger))) // Add the app.
  .use(app) // Add the error logging middleware.
  .use((0, _makeErrorMiddleware.makeErrorMiddleware)(logger));
}
//# sourceMappingURL=use-app-engine-middleware.js.map