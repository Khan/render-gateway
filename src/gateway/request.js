// @flow
import type {Response} from "superagent";
import type {RequestOptions, AbortablePromise} from "./types.js";
import type {Logger} from "../shared/types.js";
import {makeRequest} from "./make-request.js";
import {isFromCache} from "./requests-from-cache.js";
import {trace} from "../shared/index.js";

/**
 * The defaults used for request options.
 */
export const DefaultRequestOptions: RequestOptions = {
    retries: 2,
    timeout: 60000,
};

/**
 * Request a URL.
 *
 * NOTE: The AbortablePromise is only shallowly abortable. If any standard
 * promise methods are called on this, the promise they return no longer will
 * have the abort function. Therefore, you'll need to readd it.
 */
export const request = (
    logger: Logger,
    url: string,
    options?: RequestOptions,
): AbortablePromise<Response> => {
    const optionsToUse = {
        ...DefaultRequestOptions,
        ...options,
    };

    /**
     * We don't already have this request in flight, so let's make a new
     * request.
     *
     * First, we start a trace.
     * Then we make the request.
     * Then we capture the abort function so we can reattach it later.
     */
    const traceSession = trace(`request`, url, logger);
    traceSession.addLabel("url", url);
    const abortableRequest = makeRequest(optionsToUse, logger, url);

    /**
     * Now, let's do the infrastructure bits for tracing this request with
     * some useful logging data and removing completed requests from our
     * in flight list.
     */
    const finalizedPromise = abortableRequest
        .then((res) => {
            traceSession.addLabel("fromCache", isFromCache(res));
            traceSession.addLabel("successful", true);
            return res;
        })
        .finally(() => {
            traceSession.end();
        });

    /**
     * Finally, we need to turn the promise back into an abortable and add it
     * to our list of in flight requests.
     */
    const finalizedRequest: AbortablePromise<Response> = (finalizedPromise: any);
    /**
     * In tests, we might mock the promise API to return the same mock, so
     * to avoid cyclic abort calls, we only add abort if we're not the same
     * object.
     */
    if (finalizedRequest !== abortableRequest) {
        finalizedRequest.abort = () => abortableRequest.abort();
    }
    return finalizedRequest;
};
