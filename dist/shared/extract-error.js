"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractError = extractError;

/**
 * Extract the root cause error from an ambiguous error.
 *
 * This takes an ambiguous error representation and attempts to turn it into
 * a less ambiguous version.
 *
 * @param {AmbiguousError} error An object or string that represents an error.
 * @returns {SimplifiedError} A simplified error object.
 */
function extractError(error) {
  if (typeof error === "string") {
    return {
      error
    };
  }

  if (error.response && typeof error.response.error === "string") {
    return {
      error: error.response.error,
      stack: error.stack
    };
  }

  if (error.error && error !== error.error) {
    return extractError(error.error);
  }

  const errorString = error.toString();
  return {
    /**
     * If the toString just gave us the generic object response, let's
     * set it to the stack.
     */
    error: errorString === "[object Object]" ? error.stack : errorString,
    stack: error.stack
  };
}
//# sourceMappingURL=extract-error.js.map