"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatError = void 0;

/**
 * Format error metadata into a given error format string.
 *
 * @param {?string} errorFormat The format string.
 *  - If this is null, just the formatted errorMetadata will be returned.
 *  - If `{error}` is in the string, it's first occurrence will be replaced
 *    with the errorMetadata formatted with 4 space indentation.
 *  - If the `{error}` substitution is absent, the metadata will be omitted.
 * @param {any} errorMetadata The metadata that represents the error being
 * formatted.
 * @returns {string} The formatted error.
 */
const formatError = (errorFormat, errorMetadata) => {
  const formattedMetadata = JSON.stringify(errorMetadata, undefined, 4);
  if (errorFormat == null) {
    return formattedMetadata;
  }
  return errorFormat.replace("{error}", formattedMetadata);
};
exports.formatError = formatError;
//# sourceMappingURL=format-error.js.map