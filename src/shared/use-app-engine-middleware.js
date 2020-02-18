// @flow
import express from "express";
import type {$Application, $Request, $Response} from "express";
import {makeErrorMiddleware} from "./make-error-middleware.js";

import type {Logger} from "./types.js";

export const useAppEngineMiddleware = <TReq: $Request, TRes: $Response>(
    app: $Application<TReq, TRes>,
    logger: Logger,
    // TODO: Change this so that $Request is a type with the .log property.
    //       Once we add the request log middleware.
): $Application<TReq, TRes> => {
    return (
        express<TReq, TRes>()
            // TODO: Add request log middleware.
            // TODO: Add requestID middleware
            // Add the app.
            .use(app)
            .use(makeErrorMiddleware<TReq, TRes>(logger))
        // TODO: Add error handling middleware.
    );
};
