// @flow
import type {$Response, NextFunction} from "express";
import {getLogger} from "../../shared/index.js";

import type {Request} from "../types.js";

/**
 * Simple middleware that logs some info about the incoming request.
 *
 * We log both at the info and debug levels. The info log line doesn't
 * include the headers since they give us problems with exporting our
 * info logs to bigquery. The issue is that we end up with a bigquery
 * column per unique header name, and so we run out of columns.
 */
export function logRequestInfoMiddleware<Req: Request, Res: $Response>(
    req: Req,
    res: Res,
    next: NextFunction,
): void {
    const logger = getLogger(req);
    logger.info(`Request received: ${req.url}`, {
        method: req.method,
        url: req.url,
    });
    logger.debug(`Request received: ${req.url}`, {
        headers: req.headers,
        method: req.method,
        url: req.url,
    });

    next();
}
