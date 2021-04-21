// @flow
import type {Middleware, NextFunction} from "express";
import {getLogger, trace, KAError} from "../../shared/index.js";
import {Errors} from "../../ka-shared/index.js";
import {handleError} from "./handle-error.js";
import type {ITraceSession} from "../../shared/index.js";
import type {
    Request,
    Response,
    IRenderEnvironment,
    RenderAPI,
    CustomErrorHandlerFn,
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
    errorHandler: ?CustomErrorHandlerFn,
    defaultErrorResponse: ?string,
    req: Request,
    res: Response,
): Promise<void> {
    const logger = getLogger(req);

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
            throw new KAError(`Missing url query param`, Errors.InvalidInput);
        }
        throw new KAError(
            `More than one url query param given`,
            Errors.InvalidInput,
        );
    }
    const traceSession = traceFn("render", `Rendering ${renderURL}`);
    try {
        /**
         * Put together the API we make available when rendering.
         */
        const renderAPI: RenderAPI = {
            trace: traceFn,
            logger,
            // Passthrough the request headers
            headers: {...req.headers},
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
         * We don't do anything to the response headers other than validate
         * that redirect-type statuses include a Location header.
         * 3xx headers that MUST have a Location header are:
         * - 301
         * - 302
         * - 307
         * - 308
         */
        if (
            [301, 302, 307, 308].includes(status) &&
            headers["Location"] == null
        ) {
            throw new KAError(
                "Render resulted in redirection status without required Location header",
                Errors.NotAllowed,
            );
        }
        /**
         * TODO(somewhatabstract): Since we have access to the tracked
         * headers, we could generate a Vary header for the response when one
         * is not already included. This would ensure it does the right thing
         * out-of-the-box while also providing means to support more complex
         * implementations. This is super low priority though.
         */

        /**
         * Finally, we set the headers, status and send the response body.
         */
        res.header(headers);
        res.status(status);
        res.send(body);
    } catch (e) {
        await handleError(
            "Render failed",
            errorHandler,
            defaultErrorResponse,
            req,
            res,
            e,
        );
    } finally {
        traceSession.end({level: "info"});
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
    errorHandler: ?CustomErrorHandlerFn,
    defaultErrorResponse: ?string,
): Middleware<Request, Response> => (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> =>
    renderHandler(
        renderEnvironment,
        errorHandler,
        defaultErrorResponse,
        req,
        res,
    ).finally(next);
