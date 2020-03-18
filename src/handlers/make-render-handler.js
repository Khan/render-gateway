// @flow
import type {Middleware} from "express";
import type {Request, Response, RenderCallback} from "../types.js";
import {extractError} from "../shared/index.js";
import {getLogger} from "../ka-shared/index.js";

/**
 * Handle a request as a render.
 *
 * This method orchestrates the download and setup of a render environment
 * and the subsequent rendering process. The downloaded code is responsible for
 * the actual render operation.
 *
 * This is expected to be wrapped with express-async-handler.
 */
async function renderHandler(
    renderFn: RenderCallback,
    req: Request,
    res: Response,
): Promise<void> {
    const logger = getLogger(req);

    // TODO(somewhatabstract): Actually track headers and build vary header.
    //                         Encapsulate in other code to make it easily
    //                         tested.
    const trackHeaderLookup = (name: string): ?string => {
        return req.header(name);
    };
    // TODO(somewhatabstract): Hook in tracing (make sure that we don't leave
    // trace sessions open on rejection (or otherwise)).

    /**
     * TODO(somewhatabstract): Currently passing the entire URL, but we
     * want to be more specific here and define the render route better as
     * we'll really want an absolute URL.
     */
    const renderURL = req.url;
    try {
        /**
         * Defer this bit to the render callback.
         */
        const {body, status} = await renderFn(renderURL, trackHeaderLookup);

        /**
         * If the status is a redirect, we need to set the redirect header/
         */
        if (status.code === 301 || status.code === 302) {
            res.header("Location", status.targetURL);
        }
        // TODO(somewhatabstract): Add Vary header.
        res.status(status.code);
        res.send(body);
    } catch (e) {
        /**
         * Something went wrong. Let's report it!
         */
        const error = extractError(e);

        logger.error("Render failed", {...error, renderURL});
        res.status(500).json(error);
    }
}

/**
 * Create a render handler.
 *
 * This creates a handler for use with express. The created handler manages
 * executing the render process, a part of which involves invoking the given
 * render function.
 *
 * @param {RenderCallback} renderFn The function that is responsible for
 * performing the render operation.
 */
export const makeRenderHandler = (
    renderFn: RenderCallback,
): Middleware<Request, Response> => (
    req: Request,
    res: Response,
): Promise<void> => renderHandler(renderFn, req, res);
