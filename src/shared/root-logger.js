// @flow
import type {Logger} from "./types.js";

let rootLogger: ?Logger = null;

export const getRootLogger: () => ?Logger = () => rootLogger;
export const setRootLogger: (logger: Logger) => void = (logger) => {
    if (rootLogger != null) {
        throw new Error(
            "Root logger already set. Can only be set once per gateway.",
        );
    }
    rootLogger = logger;
};
