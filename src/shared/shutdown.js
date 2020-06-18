// @flow
import {extractError} from "./extract-error.js";
import type {Logger} from "./types.js";

let startedGateway: ?http$Server = null;

/**
 * Register the started gateway.
 *
 * This sets the started gateway so that it can be shutdown when
 * `shutdownGateway` is invoked.
 */
export const gatewayStarted: (gateway: http$Server) => void = (gateway) => {
    if (startedGateway != null) {
        throw new Error("Gateway already started.");
    }
    startedGateway = gateway;
};

/**
 * Shutdown the running gateway process.
 *
 * This closes any started express server and exits the process.
 * This must be written such that errors don't need to be handled by calling
 * code.
 */
export const shutdownGateway: (logger: Logger) => Promise<void> = (logger) =>
    new Promise((resolve, reject) => {
        if (startedGateway == null) {
            resolve();
            return;
        }
        logger.debug("Closing gateway.");
        startedGateway.close((err) => {
            if (err) {
                const simplifiedError = extractError(err);
                /**
                 * $FlowIgnore[extra-arg] Flow types for winston aren't aware
                 * of the callbacks the logging functions have.
                 */
                logger.error("Error closing gateway", simplifiedError, () =>
                    reject(),
                );
            } else {
                logger.info("Gateway closed. Shutting down process.", () =>
                    resolve(),
                );
            }
        });
    })
        .then(() => process.exit(0))
        .catch((err) => process.exit(1));
