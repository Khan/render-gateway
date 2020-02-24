// @flow
import {Router} from "express";

import type {$Request, $Response} from "express";

/**
 * Make the router to handle the /_api routes.
 *
 * Takes the version string to be returned via the /_api/version route.
 */
export const makeCommonServiceRouter = <Req: $Request, Res: $Response>(
    version: string,
) =>
    new Router<Req, Res>()
        .get("/_api/ping", (req: Req, res: Res) => {
            res.send("pong\n");
        })
        .get("/_api/version", (req: Req, res: Res) => {
            res.send({version});
        });
