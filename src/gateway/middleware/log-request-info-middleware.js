// @flow
import type {$Response, NextFunction} from "express";
import {getLogger} from "../../ka-shared/index.js";

import type {Request} from "../types.js";

/**
 * Simple middleware that logs some info about the incoming request.
 */
export function logRequestInfoMiddleware<Req: Request, Res: $Response>(
    req: Req,
    res: Res,
    next: NextFunction,
): void {
    getLogger(req).debug(`Request received: ${req.url}`, {
        headers: req.headers,
        method: req.method,
        url: req.url,
    });

    next();
}
