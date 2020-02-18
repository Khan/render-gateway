// @flow
import type {$Request} from "express";
import {createLogger} from "../shared/index.js";
import {getRuntimeMode} from "./get-runtime-mode.js";
import {getLogLevel} from "./get-log-level.js";
import type {Logger, RequestWithLog} from "../shared/index.js";

/**
 * Create our top-level logger on module import so that all importers of this
 * file share the same logger.
 */
const rootLogger = createLogger(getRuntimeMode(), getLogLevel());

/**
 * Get the logger to use in the current context.
 *
 * When given a request, if that request has a log property, then that logger
 * is returned, otherwise the top-level logger instance is returned. This
 * provides a convenience so that the calling code does not need to know the
 * source of the logger.
 *
 * There is no need for a logger to specifically request the top-level logger
 * as things that are logging should not care. However, in a case where there
 * is no request to use for context, it is equivalent to explicitly requesting
 * the top-level logger. To put it another way, there is no need for a semantic
 * use of getTopLevelLogger as that is not a real use-case.
 */
export const getLogger = <TReq: RequestWithLog<$Request>>(
    request?: TReq,
): Logger =>
    request != null && request.log != null ? request.log : rootLogger;
