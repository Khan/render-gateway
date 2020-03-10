"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractErrorString = extractErrorString;

/**
 * Extract an error string from an ambiguous error.
 *
 * This takes an ambiguous error representation and attempts to turn it into
 * a string for logging. If a string is passed, that string is returned.
 * This function can be recursive.
 *
 * @param {mixed} error An object or string that represents an error.
 * @returns {string} A string representing the error.
 */
function extractErrorString(error) {
  if (typeof error === "string") {
    return error;
  }

  if (error.response && error.response.error) {
    return `${error.response.error}: ${error.stack || ""}`;
  }

  if (error.error && error !== error.error) {
    return extractErrorString(error.error);
  }

  if (error.stack) {
    return error.stack;
  }

  return error.toString();
}
//# sourceMappingURL=extract-error-string.js.map