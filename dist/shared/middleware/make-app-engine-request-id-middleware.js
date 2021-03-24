"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeAppEngineRequestIDMiddleware = makeAppEngineRequestIDMiddleware;

var _getAppEngineRequestId = require("../get-app-engine-request-id.js");

var _getRequestLogger = require("../get-request-logger.js");

/**
 * Create a middleware that sets the log property of a request to a logger
 * that will attach the GAE requestID to the log metadata.
 */
function makeAppEngineRequestIDMiddleware(defaultLogger) {
  const middleware = (req, res, next) => {
    const requestID = (0, _getAppEngineRequestId.getAppEngineRequestID)(req);

    if (requestID == null) {
      // We couldn't get the GAE request ID, so let's skip on.
      next();
      return;
    }
    /**
     * We have a requestID and we know req.log exists, so let's set
     * req.log to a derived child logger that adds the requestID metadata.
     */


    const requestIDLog = (0, _getRequestLogger.getRequestLogger)(defaultLogger, req).child({
      requestID
    });
    /*
     * NOTE: the $Request type doesn't have a log field, officially.
     * However, we know that the Google middleware adds it, so now we
     * replace it with our own version.
     */

    req.log = requestIDLog;
    next();
  };

  return middleware;
}
//# sourceMappingURL=make-app-engine-request-id-middleware.js.map