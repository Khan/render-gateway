// @flow
import expressWinston from "express-winston";

import type {Middleware, $Request, $Response} from "express";
import type {Logger} from "../types.js";

/**
 * Create middleware for reporting errors.
 */
export const makeErrorMiddleware = <TReq: $Request, TRes: $Response>(
    logger: Logger,
): Middleware<TReq, TRes> =>
    /**
     * Express-winston types aren't parameterized, so we suppress the error.
     */
    expressWinston.errorLogger({
        level: "error",
        winstonInstance: logger,
    });
