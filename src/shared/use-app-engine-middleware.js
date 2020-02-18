// @flow
import express from "express";
import type {$Application, $Request, $Response} from "express";
import {makeErrorMiddleware} from "./make-error-middleware.js";
import {makeRequestMiddleware} from "./make-request-middleware.js";

import type {Logger, Runtime} from "./types.js";

/**
 * Apply the middleware that we want to use with Google App Engine (GAE).
 */
export async function useAppEngineMiddleware<TReq: $Request, TRes: $Response>(
    app: $Application<TReq, TRes>,
    mode: Runtime,
    logger: Logger,
): Promise<$Application<TReq, TRes>> {
    return (
        express<TReq, TRes>()
            // Add the request logging middleware.
            .use(await makeRequestMiddleware<TReq, TRes>(mode, logger))
            // TODO: Add requestID middleware
            // Add the app.
            .use(app)
            // Add the error logging middleware.
            .use(makeErrorMiddleware<TReq, TRes>(logger))
    );
}
