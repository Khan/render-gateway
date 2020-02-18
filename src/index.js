// @flow
import express from "express";
import type {$Request, $Response} from "express";
import {startGateway} from "./shared/index.js";
import type {GatewayOptions} from "./shared/index.js";

import * as KA from "./ka-shared/index.js";

export const KAShared = KA;

// TODO(somewhatabstract): Export appropriate KA Shared and Shared things as
// KAShared and Shared.

// TODO(somewhatabstract): Export types.

export const runServer = (options: GatewayOptions): void => {
    // TODO: Do a real server.
    // For now, we just handle all gets and return a response that is the
    // url that was requested.
    const app = express().get("/*", async (req: $Request, res: $Response) => {
        res.send(`The URL you requested was ${req.url}`);
    });

    // Start the app.
    startGateway(options, app);
};
