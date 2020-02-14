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
    // Add GAE middleware.
    const appWithMiddleware = useAppEngineMiddleware(app);

    /**
     * Start the gateway listening.
     *
     * We need the variable so we can reference it inside the error handling
     * callback. Feels a bit nasty, but it works.
     */
    const gateway = appWithMiddleware.listen(options.port, (err: ?Error) => {
        if (gateway == null || err != null) {
            // eslint-disable-next-line no-console
            console.error(
                `${options.name} appears not to have started: ${(err &&
                    err.message) ||
                    "Unknown error"}`,
            );
            return;
        }

        const address = gateway.address();
        if (address == null || typeof address === "string") {
            // eslint-disable-next-line no-console
            console.warn(
                `${options.name} may not have started properly: ${address}`,
            );
            return;
        }

        const host = address.address;
        const port = address.port;
        // eslint-disable-next-line no-console
        console.info(`${options.name} running at http://${host}:${port}`);
    });
};
