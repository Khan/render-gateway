// @flow
import type {Middleware, $Request, $Response, NextFunction} from "express";
import type {RequestWithLog} from "../types.js";

/**
 * We want to ensure that the client doesn't use Keep Alive to keep the HTTP
 * connection open to the server, so we send back a Connection: close header
 * to get it to close right away.
 */
export const makeCloseConnectionMiddleware = <
    TReq: RequestWithLog<$Request>,
    TRes: $Response,
>(): Middleware<TReq, TRes> => {
    const middleware: <TReq: RequestWithLog<$Request>, TRes: $Response>(
        req: TReq,
        res: TRes,
        next: NextFunction,
    ) => Promise<void> = async (req, res, next) => {
        // Tell the client to not keep the connection alive, this will
        // ensure that we're able to shutdown the server as soon as the
        // request has finished.
        res.set("Connection", "close");
        next();
    };
    return middleware;
};
