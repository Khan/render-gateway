// @flow
import {extractError} from "./extract-error.js";
import type {ErrorKind, SimplifiedError} from "./types.js";

/**
 * Error to be thrown and logged within KA code.
 *
 * This custom error supports error taxonomy.
 */
export default class KAError<TKind: ErrorKind> extends Error {
    kind: TKind;
    sourceError: ?SimplifiedError;

    /**
     * Construct a KAError instance.
     *
     * @param {string} message The error message.
     * @param {TKind} kind The kind of error.
     * @param {Error} [sourceError] The original error that spawned this one.
     */
    constructor(message: string, kind: TKind, sourceError: ?Error = null) {
        super(message);

        // Set the name so we get a nice error output, like
        // KAInternalError
        this.name = `KA${kind}Error`;

        // The kind of error which could be used for categorization with
        // other error sources that use the same error taxonomy.
        this.kind = kind;

        // If there is a source error that we're wrapping, we also want to
        // unpack that and attach it for additional diagnostics.
        if (sourceError != null) {
            this.sourceError = extractError(sourceError);
        }
    }
}
