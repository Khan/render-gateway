// @flow
import {extractError} from "../../shared/index.js";
import {getLogger} from "../../ka-shared/index.js";
import {formatError} from "../format-error.js";
import type {AmbiguousError} from "../../shared/index.js";
import type {Request, Response, CustomErrorHandlerFn} from "../types.js";

/**
 * Handle an ambiguous error and determine an appropriate response.
 *
 * @param {string} overallProblem A simple description of what problem the error
 * explains.
 * @param {?CustomErrorHandlerFn} errorHandler A possible custom error handler
 * that can generate a response for the error.
 * @param {Request} req The request that was being handled when the error
 * occurred.
 * @param {Response} res The response that is being generated and to which the
 * error is reported.
 * @param {AmbiguousError} error The error that is to be handled.
 */
export const handleError = (
    overallProblem: string,
    errorHandler: ?CustomErrorHandlerFn,
    defaultErrorResponse: ?string,
    req: Request,
    res: Response,
    error: AmbiguousError,
): void => {
    const logger = getLogger(req);
    /**
     * Something went wrong. Let's report it!
     */
    const simplifiedError = extractError(error);

    /**
     * We're definitely returning an error for this one.
     */
    res.status(500);

    /**
     * The calling code should handle if the original request was valid or
     * not, so we just appease flow here.
     */
    const requestURL = typeof req.query.url === "string" ? req.query.url : "";

    /**
     * Before we return the basic 500 error, let's give our configuration a
     * chance to make a nicer error page.
     */
    try {
        const overriddenResponse = errorHandler?.(
            requestURL,
            req.headers,
            simplifiedError,
        );
        if (overriddenResponse != null) {
            const {body, headers} = overriddenResponse;
            logger.error(`${overallProblem}; custom error response generated`, {
                ...simplifiedError,
                requestURL,
            });
            res.header(headers);
            res.send(body);
            return;
        }
    } catch (customHandlerError) {
        /**
         * Oh no, our configuration threw too!
         * Ouch. We should report this.
         */
        const innerError = extractError(customHandlerError);
        logger.error(`${overallProblem}; custom handler failed`, {
            ...innerError,
            originalError: simplifiedError,
            requestURL,
        });
        res.send(
            formatError(defaultErrorResponse, {
                ...innerError,
                originalError: simplifiedError,
            }),
        );
        return;
    }

    /**
     * This is the default response if there was no error handler or the
     * error handler didn't provide an override response.
     */
    logger.error(`${overallProblem}; uncaught error`, {
        ...simplifiedError,
        requestURL,
    });
    res.send(formatError(defaultErrorResponse, simplifiedError));
};
