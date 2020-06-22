"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeRequestMiddleware = void 0;

var lw = _interopRequireWildcard(require("@google-cloud/logging-winston"));

var _expressWinston = _interopRequireDefault(require("express-winston"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Create middleware for tracking requests.
 */
const makeRequestMiddleware = (mode, logger) => {
  if (mode === "production") {
    /**
     * In production, we're using the Google middleware. This adds the
     * log property to the request, allowing us to associate log entries
     * with a request trace, if the request is being traced.
     *
     * WORKAROUND: We must pass the corresponding transport here or it will
     * get added for us and then we'll have double logging.
     */
    return lw.express.makeMiddleware(logger, new lw.LoggingWinston());
  }
  /**
   * In all other cases, we use express-winston to log requests for us.
   */


  return Promise.resolve(_expressWinston.default.logger({
    /**
     * Specify the level that this logger logs at.
     * (use a function to dynamically change level based on req and res)
     *     `function(req, res) { return String; }`
     */
    level: "info",

    /**
     * Use the logger we already set up.
     */
    winstonInstance: logger,
    expressFormat: true,
    colorize: true,
    meta: false
  }));
};

exports.makeRequestMiddleware = makeRequestMiddleware;
//# sourceMappingURL=make-request-middleware.js.map