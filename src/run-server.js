// @flow
import express from "express";
import asyncHandler from "express-async-handler";
import {startGateway} from "./shared/index.js";
import type {RenderGatewayOptions, Request, Response} from "./types.js";
import type {GatewayOptions} from "./shared/index.js";
import {getLogger, makeCommonServiceRouter} from "./ka-shared/index.js";
import {getRuntimeMode} from "./ka-shared/get-runtime-mode.js";
import {makeCheckSecretMiddleware} from "./middleware/make-check-secret-middleware.js";
import {renderHandler} from "./handlers/render-handler.js";

/**
 * Run the render-gateway server using the provided options.
 */
export const runServer = async (
    options: RenderGatewayOptions,
): Promise<void> => {
    const {authentication, ...remainingOptions} = options;

    const app = express<Request, Response>()
        .use(
            /**
             * This sets up the /_api/ route handlers that are used by the KA
             * deployment system.
             */
            makeCommonServiceRouter(
                process.env.GAE_VERSION || "fake-dev-version",
            ),
        )
        /**
         * This adds a check that requests below this point are coming from
         * a known source.
         */
        .use(await makeCheckSecretMiddleware(authentication))
        /**
         * This is our render route. This will handle all remaining gets as
         * render requests and response accordingly.
         */
        .get("/*", asyncHandler(renderHandler));

    // Start the gateway.
    const gatewayOptions: GatewayOptions = {
        mode: getRuntimeMode(),
        logger: getLogger(),
        ...remainingOptions,
    };
    startGateway<Request, Response>(gatewayOptions, app);
};
