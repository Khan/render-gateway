// @flow
import express from "express";
import asyncHandler from "express-async-handler";
import {startGateway, getGatewayInfo} from "../shared/index.js";
import type {RenderGatewayOptions, Request, Response} from "./types.js";
import type {GatewayOptions} from "../shared/index.js";
import {
    getRuntimeMode,
    getLogger,
    makeCommonServiceRouter,
} from "../ka-shared/index.js";
import {makeCheckSecretMiddleware} from "./middleware/make-check-secret-middleware.js";
import {makeRenderHandler} from "./handlers/make-render-handler.js";

/**
 * Run the render-gateway server using the provided options.
 *
 * @param {RenderGatewayOptions} options The options that define how the
 * render gateway will operate.
 * @returns {Promise<void>} The promise of working.
 */
export const runServer = async (
    options: RenderGatewayOptions,
): Promise<void> => {
    const {authentication, renderFn, ...remainingOptions} = options;
    const {version} = getGatewayInfo();

    const app = express<Request, Response>()
        .use(
            /**
             * This sets up the /_api/ route handlers that are used by the KA
             * deployment system.
             */
            makeCommonServiceRouter(version),
        )
        /**
         * This adds a check that requests below this point are coming from
         * a known source.
         */
        .use(await makeCheckSecretMiddleware(authentication))
        /**
         * This is our render route. See the handler to learn how the magic
         * happens.
         */
        .get("/render", asyncHandler(makeRenderHandler(renderFn)));

    // Start the gateway.
    const gatewayOptions: GatewayOptions = {
        mode: getRuntimeMode(),
        logger: getLogger(),
        ...remainingOptions,
    };
    startGateway<Request, Response>(gatewayOptions, app);
};
