// @flow
import type {$Application, $Request, $Response} from "express";
import {useAppEngineMiddleware} from "./use-app-engine-middleware.js";
import type {GatewayOptions} from "./types.js";

/**
 * Start a gateway application server.
 *
 * This takes a server application definition and attaches middleware before
 * listening on the appropriate port per the passed options.
 */
export const startGateway = (
    options: GatewayOptions,
    app: $Application<$Request, $Response>,
): void => {
    const {logger, port, name} = options;

    // Add GAE middleware.
    const appWithMiddleware = useAppEngineMiddleware(app);

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
};
