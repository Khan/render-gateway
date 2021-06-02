// @flow
import {Router} from "express";
import asyncHandler from "express-async-handler";

import type {$Request, $Response, NextFunction} from "express";
import type {WarmUpHandlerFn} from "../types.js";
import type {RequestWithLog} from "../../shared/index.js";

/**
 * Make the router to handle the /_api routes.
 *
 * Takes the version string to be returned via the /_api/version route.
 */
export const makeCommonServiceRouter = <Req: $Request, Res: $Response>(
    version: string,
    warmUpHandler: ?WarmUpHandlerFn,
): express$Router<Req, Res> =>
    new Router<Req, Res>()
        .get("/_api/ping", (req: Req, res: Res) => {
            res.send("pong\n");
        })
        .get("/_api/version", (req: Req, res: Res) => {
            res.send({version});
        })
        .get(
            "/_ah/warmup",
            asyncHandler(
                async (
                    req: RequestWithLog<Req>,
                    res: Res,
                    next: NextFunction,
                ) => {
                    await warmUpHandler?.(req.headers);
                    res.send("OK\n");
                },
            ),
        );
