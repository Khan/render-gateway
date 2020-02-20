// @flow
import express from "express";
import type {$Request, $Response} from "express";
import {startGateway} from "./shared/index.js";
import type {RenderGatewayOptions} from "./types.js";
import type {GatewayOptions, RequestWithLog} from "./shared/index.js";
import {getLogger} from "./ka-shared/index.js";
import {getRuntimeMode} from "./ka-shared/get-runtime-mode.js";

/**
 * Run the render-gateway server using the provided options.
 */
export const runServer = (options: RenderGatewayOptions): void => {
    // TODO: Do a real server.
    //   For now, we just handle all gets and return a response that is the
    //   url that was requested.
    const app = express<RequestWithLog<$Request>, $Response>().get(
        "/*",
        async (req, res) => {
            res.send(`The URL you requested was ${req.url}`);
        },
    );

    // Start the gateway.
    const gatewayOptions: GatewayOptions = {
        mode: getRuntimeMode(),
        logger: getLogger(),
        ...options,
    };
    startGateway<RequestWithLog<$Request>, $Response>(gatewayOptions, app);
};
