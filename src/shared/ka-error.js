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
     * Construct KAError instance.
     *
     * @param {string} message The error message.
     * @param {TKind} kind The kind of KA error.
     * @param {Error} [sourceError] The original error that spawned this one.
     */
    constructor(message: string, kind: TKind, sourceError: ?Error = null) {
        super(message);
        this.name = `KA${kind}Error`;
        this.kind = kind;

        if (sourceError != null) {
            this.sourceError = extractError(sourceError);
        }
    }
}
