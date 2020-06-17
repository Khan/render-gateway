// @flow
import type {Logger} from "./types.js";

/**
 * Utility method for gracefully shutting down the server.
 */
export const shutdown = (server: http$Server, logger: Logger) => {
    logger.info("Gracefully shutting down server.");

    try {
        server.close((err) => {
            if (err) {
                logger.error(
                    `Error shutting down server: ${
                        (err && err.message) || "Unknown Error"
                    }`,
                );
                process.exit(1);
            } else {
                process.exit(0);
            }
        });
    } catch (err) {
        logger.error(
            `Error closing server: ${(err && err.message) || "Unknown Error"}`,
        );
        process.exit(1);
    }
};
