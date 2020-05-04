"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleError = void 0;

var _index = require("../../shared/index.js");

var _index2 = require("../../ka-shared/index.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
const handleError = (overallProblem, errorHandler, req, res, error) => {
  const logger = (0, _index2.getLogger)(req);
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
    const overriddenResponse = errorHandler === null || errorHandler === void 0 ? void 0 : errorHandler(requestURL, req.headers, simplifiedError);

    if (overriddenResponse != null) {
      const {
        body,
        headers
      } = overriddenResponse;
      logger.error(`${overallProblem}; custom error response generated`, _objectSpread({}, simplifiedError, {
        requestURL
      }));
      res.send(body);
      res.header(headers);
      return;
    }
  } catch (customHandlerError) {
    /**
     * Oh no, our configuration threw too!
     * Ouch. We should report this.
     */
    const innerError = (0, _index.extractError)(customHandlerError);
    logger.error(`${overallProblem}; custom handler failed`, _objectSpread({}, innerError, {
      originalError: simplifiedError,
      requestURL
    })); // TODO(somewhatabstract, WEB-2085): Part two is to add a nicer format
    // for errors that reach this point.

    res.json(_objectSpread({}, innerError, {
      originalError: simplifiedError
    }));
    return;
  }
  /**
   * This is the default response if there was no error handler or the
   * error handler didn't provide an override response.
   */


  logger.error(`${overallProblem}; uncaught error`, _objectSpread({}, simplifiedError, {
    requestURL
  })); // TODO(somewhatabstract, WEB-2085): Part two is to add a nicer format
  // for errors that reach this point.

  res.json(simplifiedError);
};

exports.handleError = handleError;
//# sourceMappingURL=handle-error.js.map