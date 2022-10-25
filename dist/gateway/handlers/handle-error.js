"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleError = void 0;
var _index = require("../../shared/index.js");
var _index2 = require("../../ka-shared/index.js");
var _formatError = require("../format-error.js");

/**
 * Handle an ambiguous error and determine an appropriate response.
 *
 * @param {string} overallProblem A simple description of what problem the error
 * explains.
 * @param {?CustomErrorHandlerFn} errorHandler A possible custom error handler
 * that can generate a response for the error.
 * @param {Request} req The request that was being handled when the error
 * occurred.
 * @param {Response} res The response that is being generated and to which the
 * error is reported.
 * @param {AmbiguousError} error The error that is to be handled.
 */
const handleError = async (overallProblem, errorHandler, defaultErrorResponse, req, res, error) => {
  const logger = (0, _index.getLogger)(req);
  /**
   * Something went wrong. Let's report it!
   */
  const simplifiedError = (0, _index.extractError)(error);

  /**
   * We're definitely returning an error for this one.
   */
  res.status(500);

  /**
   * The calling code should handle if the original request was valid or
   * not, so we just appease flow here.
   */
  const requestURL = typeof req.query.url === "string" ? req.query.url : "";

  /**
   * Before we return the basic 500 error, let's give our configuration a
   * chance to make a nicer error page.
   */
  try {
    const overriddenResponse = await (errorHandler === null || errorHandler === void 0 ? void 0 : errorHandler(requestURL, req.headers, simplifiedError));
    if (overriddenResponse != null) {
      const {
        body,
        headers
      } = overriddenResponse;
      logger.error(`${overallProblem}; custom error response generated`, {
        ...simplifiedError,
        requestURL,
        kind: _index2.Errors.TransientKhanService
      });
      res.header(headers);
      res.send(body);
      return;
    }
  } catch (customHandlerError) {
    /**
     * Oh no, our configuration threw too!
     * Ouch. We should report this.
     */
    const innerError = (0, _index.extractError)(customHandlerError);
    logger.error(`${overallProblem}; custom handler failed`, {
      ...innerError,
      originalError: simplifiedError,
      requestURL,
      kind: _index2.Errors.TransientKhanService
    });
    res.send((0, _formatError.formatError)(defaultErrorResponse, {
      ...innerError,
      originalError: simplifiedError
    }));
    return;
  }

  /**
   * This is the default response if there was no error handler or the
   * error handler didn't provide an override response.
   */
  logger.error(`${overallProblem}; uncaught error`, {
    ...simplifiedError,
    requestURL,
    kind: _index2.Errors.TransientKhanService
  });
  res.send((0, _formatError.formatError)(defaultErrorResponse, simplifiedError));
};
exports.handleError = handleError;
//# sourceMappingURL=handle-error.js.map