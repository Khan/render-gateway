// @flow
import type {$Application, $Request, $Response} from "express";
import {useAppEngineMiddleware} from "./use-app-engine-middleware.js";
import {setupStackdriver} from "./setup-stackdriver.js";
import type {GatewayOptions, RequestWithLog} from "./types.js";

/**
 * Start a gateway application server.
 *
 * This takes a server application definition and attaches middleware before
 * listening on the appropriate port per the passed options.
 */
export async function startGateway<
    TReq: RequestWithLog<$Request>,
    TRes: $Response,
>(options: GatewayOptions, app: $Application<TReq, TRes>): Promise<void> {
    const {logger, port, name, mode} = options;

    /**
     * Make sure GAE_SERVICE has a value.
     *
     * If it isn't set at this point, we're not running in GAE, so we can
     * set it ourselves.
     */
    if (process.env.GAE_SERVICE == null) {
        process.env.GAE_SERVICE = name;
    }

    // Set up stackdriver integrations.
    await setupStackdriver(mode);

    // Add GAE middleware.
    const appWithMiddleware = await useAppEngineMiddleware<TReq, TRes>(
        app,
        mode,
        logger,
    );

    /**
     * Start the gateway listening.
     *
     * We need the variable so we can reference it inside the error handling
     * callback. Feels a bit nasty, but it works.
     */
    const gateway = appWithMiddleware.listen(port, (err: ?Error) => {
        if (gateway == null || err != null) {
            logger.error(
                `${name} appears not to have started: ${(err && err.message) ||
                    "Unknown error"}`,
            );
            return;
        }

        const address = gateway.address();
        if (address == null || typeof address === "string") {
            logger.warn(`${name} may not have started properly: ${address}`);
            return;
        }

        const host = address.address;
        const port = address.port;
        logger.info(`${name} running at http://${host}:${port}`);
    });
}
