// @flow
import type {$Response, NextFunction} from "express";
import {getLogger} from "../../shared/index.js";

import type {Request} from "../types.js";

/**
 * Simple middleware that logs some info about the incoming request.
 *
 * We flatten the headers since they give us problems with exporting
 * our info logs to bigquery if we don't. The issue is that we end up
 * with a bigquery column per unique header name, and so we run out of
 * columns.
 */
export function logRequestInfoMiddleware<Req: Request, Res: $Response>(
    req: Req,
    res: Res,
    next: NextFunction,
): void {
    const flattenedHeaders = Object.keys(req.headers).reduce(
        (headers, key) => headers + `${key}: ${req.headers[key]}\n`,
        "",
    );
    getLogger(req).info(`Request received: ${req.url}`, {
        headers: flattenedHeaders,
        method: req.method,
        url: req.url,
    });

    next();
}
