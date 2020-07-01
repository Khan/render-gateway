// @flow
import {VirtualConsole} from "jsdom16";
import {extractError} from "../../../shared/index.js";
import type {Logger} from "../../../shared/index.js";

/**
 * Create a virtual console for use with JSDOM.
 *
 * @param {Logger} logger The logger to which this virtual console logs.
 * @returns {VirtualConsole} A JSDOM VirtualConsole instance.
 */
export const createVirtualConsole = (logger: Logger): VirtualConsole => {
    const virtualConsole = new VirtualConsole();
    virtualConsole.on("jsdomError", (e: Error) => {
        if (e.message.indexOf("Could not load img") >= 0) {
            // We know that images cannot load. We're deliberately blocking
            // them.
            return;
        }
        const simplifiedError = extractError(e);
        logger.error(`JSDOM:${simplifiedError.error || ""}`, simplifiedError);
    });

    // NOTE: We pass args array as the metadata parameter for winston log.
    virtualConsole.on("error", (message, ...args) =>
        logger.error(`JSDOM:${message}`, args),
    );
    virtualConsole.on("warn", (message, ...args) =>
        logger.warn(`JSDOM:${message}`, args),
    );
    virtualConsole.on("info", (message, ...args) =>
        logger.info(`JSDOM:${message}`, args),
    );
    virtualConsole.on("log", (message, ...args) =>
        /**
         * Winston uses log for a different, core thing, so let's map log to
         * info.
         */
        logger.info(`JSDOM:${message}`, args),
    );
    virtualConsole.on("debug", (message, ...args) =>
        logger.debug(`JSDOM:${message}`, args),
    );
    return virtualConsole;
};
