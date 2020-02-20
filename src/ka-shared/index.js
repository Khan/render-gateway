// @flow
export {getLogger} from "./get-logger.js";

/**
 * NOTE: getRuntimeMode and startTraceAgent should be imported directly. They
 * are special cases because startTraceAgent must be used before any other
 * imports and it relies on getRuntimeMode.
 */
