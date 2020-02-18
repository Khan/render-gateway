// @flow
import {createLogger} from "../shared/create-logger.js";
import {getRuntimeMode} from "./get-runtime-mode.js";
import {getLogLevel} from "./get-log-level.js";
import type {Logger} from "../shared/types.js";

/**
 * Create our top-level logger on module import so that all importers of this
 * file share the same logger.
 */
const rootLogger = createLogger(getRuntimeMode(), getLogLevel());

/**
 * Get the logger to use in the current context.
 *
 * TODO(somewhatabstract): Update to support request-scoped loggers
 */
export const getLogger = (): Logger => rootLogger;
