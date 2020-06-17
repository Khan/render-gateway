"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAppEngineMiddleware = useAppEngineMiddleware;

var _express = _interopRequireDefault(require("express"));

var _makeErrorMiddleware = require("./make-error-middleware.js");

var _makeRequestMiddleware = require("./make-request-middleware.js");

var _makeAppEngineRequestIdMiddleware = require("./make-app-engine-request-id-middleware.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Apply the middleware that we want to use with Google App Engine (GAE).
 */
async function useAppEngineMiddleware(app, mode, logger) {
  return (0, _express.default)() // Add the request logging middleware.
  .use(await (0, _makeRequestMiddleware.makeRequestMiddleware)(mode, logger)) // Add requestID middleware
  .use((0, _makeAppEngineRequestIdMiddleware.makeAppEngineRequestIDMiddleware)(logger)) // Add the app.
  .use(app) // Add the error logging middleware.
  .use((0, _makeErrorMiddleware.makeErrorMiddleware)(logger)).use((req, res, next) => {
    logger.info("USE CATCHALL");
    next();
  });
}
//# sourceMappingURL=use-app-engine-middleware.js.map