// @flow
import express from "express";
import asyncHandler from "express-async-handler";
import type {$Application, $Request, $Response} from "express";
import {makeErrorMiddleware} from "./middleware/make-error-middleware.js";
import {makeRequestMiddleware} from "./middleware/make-request-middleware.js";
import {makeAppEngineRequestIDMiddleware} from "./middleware/make-app-engine-request-id-middleware.js";
import {makeMemoryMonitoringMiddleware} from "./middleware/make-memory-monitoring-middleware.js";

import type {Logger, Runtime} from "./types.js";

/**
 * Apply the middleware that we want to use with Google App Engine (GAE).
 */
export async function useAppEngineMiddleware<TReq: $Request, TRes: $Response>(
    app: $Application<TReq, TRes>,
    mode: Runtime,
    logger: Logger,
): Promise<$Application<TReq, TRes>> {
    const wrappedApp = express<TReq, TRes>()
        // Add the request logging middleware.
        .use(await makeRequestMiddleware(mode, logger))
        // Add requestID middleware.
        .use(makeAppEngineRequestIDMiddleware(logger))
        // Add the app.
        .use(app)
        // Add the error logging middleware.
        .use(makeErrorMiddleware(logger));

    // Add memory monitoring, if it is supported.
    const memoryMonitoringMiddleware = makeMemoryMonitoringMiddleware(logger);
    if (memoryMonitoringMiddleware != null) {
        return wrappedApp.use(asyncHandler(memoryMonitoringMiddleware));
    }
    return wrappedApp;
}
