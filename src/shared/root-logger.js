// @flow
import KAError from "./ka-error.js";
import {Errors} from "./errors.js";
import type {Logger} from "./types.js";

let rootLogger: ?Logger = null;

export const getRootLogger: () => ?Logger = () => rootLogger;
export const setRootLogger: (logger: Logger) => void = (logger) => {
    if (rootLogger != null) {
        throw new KAError(
            "Root logger already set. Can only be set once per gateway.",
            Errors.Internal,
        );
    }
    rootLogger = logger;
};
