// @flow
import type {AmbiguousError, SimplifiedError} from "./types.js";

/**
 * Extract the root cause error from an ambiguous error.
 *
 * This takes an ambiguous error representation and attempts to turn it into
 * a less ambiguous version.
 *
 * @param {AmbiguousError} error An object or string that represents an error.
 * @returns {SimplifiedError} A simplified error object.
 */
export function extractError(error: AmbiguousError): SimplifiedError {
    if (typeof error === "string") {
        return {error};
    }

    if (error.response && typeof error.response.error === "string") {
        return {
            error: error.response.error,
            stack: error.stack,
        };
    }

    if (error.error && error !== error.error) {
        return extractError((error.error: any));
    }

    const errorString = error.toString();
    return {
        /**
         * If the toString just gave us the generic object response, let's
         * set it to the stack.
         */
        error: errorString === "[object Object]" ? error.stack : errorString,
        stack: error.stack,
    };
}
