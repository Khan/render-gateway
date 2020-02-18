// @flow
import express from "express";
import type {$Request, $Response} from "express";
import {startGateway} from "./shared/start-gateway.js";
import type {GatewayOptions} from "./shared/types.js";

export default function runServer(options: GatewayOptions) {
    // TODO: Do a real server.
    // For now, we just handle all gets and return a response that is the
    // url that was requested.
    const app = express().get("/*", async (req: $Request, res: $Response) => {
        res.send(req.url);
    });

    // Start the app.
    startGateway(options, app);
}
