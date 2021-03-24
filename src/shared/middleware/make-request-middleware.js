// @flow
import * as lw from "@google-cloud/logging-winston";
import expressWinston from "express-winston";

import type {Middleware, $Request, $Response} from "express";
import type {Logger, Runtime} from "../types.js";

/**
 * Create middleware for tracking requests.
 */
export const makeRequestMiddleware = <TReq: $Request, TRes: $Response>(
    mode: Runtime,
    logger: Logger,
): Promise<Middleware<TReq, TRes>> => {
    if (mode === "production") {
        /**
         * In production, we're using the Google logging-winston middleware.
         * This adds the log property to the request, allowing us to associate
         * log entries with a request trace, if the request is being traced.
         */
        return lw.express.makeMiddleware(logger);
    }

    /**
     * In all other cases, we use express-winston to log requests for us.
     */
    return Promise.resolve(
        expressWinston.logger({
            /**
             * Specify the level that this logger logs at.
             * (use a function to dynamically change level based on req and res)
             *     `function(req, res) { return String; }`
             */
            level: "info",

            /**
             * Use the logger we already set up.
             */
            winstonInstance: logger,
            expressFormat: true,
            colorize: true,
            meta: false,
        }),
    );
};
