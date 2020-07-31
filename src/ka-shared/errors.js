// @flow
import {Errors as SharedErrors} from "../shared/index.js";

/**
 * @typedef {Object} Errors The different errors in our error taxononomy.
 * @extends SharedErrors
 *
 * @property {ErrorKind} TransientKhanService There was a problem when
 * contacting another Khan service that might be resolvable by retrying.
 *
 * @property {ErrorKind} KhanService There was a non-transient problem when
 * contacting another Khan service.
 */

/**
 * @type {Errors} A utility for referencing our error taxonomy.
 */
export const Errors = Object.freeze({
    ...SharedErrors,
    TransientKhanService: "TransientKhanService",
    KhanService: "KhanService",
});
