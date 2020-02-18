// @flow
import express from "express";

import type {$Application, $Request, $Response} from "express";

export const useAppEngineMiddleware = (
    app: $Application<$Request, $Response>,
    // TODO: Change this so that $Request is a type with the .log property.
    //       Once we add the request log middleware.
): $Application<$Request, $Response> => {
    return (
        express()
            // TODO: Add request log middleware.
            // TODO: Add requestID middleware
            // Add the app.
            .use(app)
        // TODO: Add error handling middleware.
    );
};
