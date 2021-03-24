// @flow
import {VirtualConsole} from "jsdom";
import {extractError} from "../../../shared/index.js";
import {Errors} from "../../../ka-shared/index.js";
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
        logger.error(`JSDOM jsdomError:${simplifiedError.error || ""}`, {
            ...simplifiedError,
            kind: Errors.Internal,
        });
    });

    /**
     * NOTE(somewhatabstract): We pass args array as the metadata parameter for
     * winston log. We don't worry about adding the error kind here; we mark
     * these as Errors.Internal automatically if they don't already include a
     * kind.
     */
    virtualConsole.on("error", (message, ...args) =>
        logger.error(`JSDOM error:${message}`, {args}),
    );

    /**
     * We log all other things as `silly`, since they are generally only useful
     * to us when we're developing/debugging issues locally, and not in
     * production. We could add some way to turn this on in production
     * temporarily (like a temporary "elevate log level" query param) if
     * we find that will be useful, but I haven't encountered an issue that
     * needed these in production yet; they're just noise.
     */
    const passthruLog = (method: "warn" | "info" | "log" | "debug") => {
        virtualConsole.on(method, (message, ...args) =>
            logger.silly(`JSDOM ${method}:${message}`, {args}),
        );
    };
    passthruLog("warn");
    passthruLog("info");
    passthruLog("log");
    passthruLog("debug");
    return virtualConsole;
};
