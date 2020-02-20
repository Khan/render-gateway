// @flow
import express from "express";
import type {$Request, $Response} from "express";
import {startGateway} from "./shared/index.js";
import type {GatewayOptions, RequestWithLog} from "./shared/index.js";

export const runServer = (options: GatewayOptions): void => {
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
    startGateway<RequestWithLog<$Request>, $Response>(options, app);
};
