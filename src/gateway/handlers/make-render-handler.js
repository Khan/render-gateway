// @flow
import type {Middleware} from "express";
import {extractError} from "../../shared/index.js";
import {getLogger, trace} from "../../ka-shared/index.js";
import type {ITraceSession} from "../../shared/index.js";
import type {
    Request,
    Response,
    IRenderEnvironment,
    RenderAPI,
} from "../types.js";

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
    renderEnvironment: IRenderEnvironment,
    req: Request,
    res: Response,
): Promise<void> {
    const logger = getLogger(req);

    /**
     * TODO(somewhatabstract, WEB-1108): Actually track headers and build vary
     * header.
     * Encapsulate in other code to make it easily tested.
     */
    const trackHeaderLookup = (name: string): ?string => {
        return req.header(name);
    };

    /**
     * TODO(somewhatabstract, WEB-2057): Make sure that we don't leave trace
     * sessions open on rejection (or otherwise).
     *
     * For now, we'll assume callers will tidy up.
     */
    const traceFn = (action: string, message: string): ITraceSession =>
        trace(action, message, req);

    /**
     * The URL being rendered is given in a query param named, url.
     */
    const renderURL = req.query.url;
    if (typeof renderURL !== "string") {
        if (renderURL == null) {
            throw new Error(`Missing url query param`);
        }
        throw new Error(`More than one url query param given`);
    }
    const traceSession = traceFn("render", `Rendering ${renderURL}`);
    try {
        /**
         * Put together the API we make available when rendering.
         */
        const renderAPI: RenderAPI = {
            getHeader: trackHeaderLookup,
            trace: traceFn,
            logger,
        };

        /**
         * Defer this bit to the render callback.
         */
        const {body, status, headers} = await renderEnvironment.render(
            renderURL,
            renderAPI,
        );
        traceSession.addLabel("/result/status", status);
        traceSession.addLabel("/result/headers", headers);

        /**
         * TODO(somewhatabstract, WEB-1108): Validate the status with the
         * headers.
         * There are a couple where we know we need certain things to match
         * 1. If a Vary header is included, we should error to indicate that
         *    is not allowed
         * 2. For 301/302 status, we need a `Location` header.
         *
         * validateStatusAndHeaders(status, headers);
         */

        // TODO(somewhatabstract, WEB-1108): Add headers.
        // TODO(somewhatabstract, WEB-1108): Add Vary header.
        res.status(status);
        res.send(body);
    } catch (e) {
        /**
         * Something went wrong. Let's report it!
         */
        const error = extractError(e);

        logger.error("Render failed", {...error, renderURL});
        res.status(500).json(error);
    } finally {
        traceSession.end();
    }
}

/**
 * Create a render handler.
 *
 * This creates a handler for use with express. The created handler manages
 * executing the render process, a part of which involves invoking a render
 * within the given render environment.
 *
 * @param {IRenderEnvironment} renderEnvironment The environment responsible for
 * performing renders.
 */
export const makeRenderHandler = (
    renderEnvironment: IRenderEnvironment,
): Middleware<Request, Response> => (
    req: Request,
    res: Response,
): Promise<void> => renderHandler(renderEnvironment, req, res);
