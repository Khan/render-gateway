// @flow
import type {Response} from "superagent";
import type {
    InFlightRequests,
    RequestOptions,
    AbortablePromise,
} from "./types.js";
import type {Logger} from "./shared/types.js";
import {makeRequest} from "./make-request.js";
import {isFromCache} from "./requests-from-cache.js";
import {trace} from "./ka-shared/index.js";

/**
 * This tracks our inflight requests.
 */
const inFlightRequests: InFlightRequests = {};

/**
 * Abort any requests that are inflight and clears the inflight request queue.
 */
export const abortInFlightRequests = (): void => {
    for (const url of Object.keys(inFlightRequests)) {
        const request = inFlightRequests[url];
        delete inFlightRequests[url];
        request.abort();
    }
};

/**
 * Request a URL.
 *
 * Unlike makeRequest, which makes a new request, this will track inflight
 * requests and if there is one for the request being made, return that instead
 * of making a new one.
 *
 * NOTE: The AbortablePromise is only shallowly abortable. If any standard
 * promise methods are called on this, the promise they return no longer will
 * have the abort function. Therefore, you'll need to readd it.
 */
export const request = (
    options: RequestOptions,
    logger: Logger,
    url: string,
): AbortablePromise<Response> => {
    /**
     * Something may have already started this request. If it is already
     * "in flight", let's use it rather than making a whole new one.
     */
    const inFlight = inFlightRequests[url];
    if (inFlight != null) {
        return inFlight;
    }

    /**
     * We don't already have this request in flight, so let's make a new
     * request.
     *
     * First, we start a trace.
     * Then we make the request.
     * Then we capture the abort function so we can reattach it later.
     */
    const traceSession = trace(`REQ: ${url}`, logger);
    const abortableRequest = makeRequest(options, logger, url);
    const abortFn = abortableRequest.abort;

    /**
     * Now, let's do the infrastructure bits for tracing this request with
     * some useful logging data and removing completed requests from our
     * in flight list.
     */
    const traceInfo = {};
    const finalizedPromise = abortableRequest
        .then((res) => {
            traceInfo.fromCache = isFromCache(res);
            traceInfo.successful = true;
            return res;
        })
        .finally(() => {
            delete inFlightRequests[url];
            traceSession.end(traceInfo);
        });

    /**
     * Finally, we need to turn the promise back into an abortable and add it
     * to our list of in flight requests.
     */
    const finalizedRequest: AbortablePromise<Response> = (finalizedPromise: any);
    finalizedRequest.abort = abortFn;
    inFlightRequests[url] = finalizedRequest;
    return finalizedRequest;
};
