// @flow
import {URL} from "url";
import {ResourceLoader} from "jsdom";
import type {FetchOptions} from "jsdom";
import type {RequestOptions, RenderAPI} from "../../types.js";
import {getAgentForURL} from "../../../shared/index.js";
import {
    DefaultRequestOptions,
    request,
    abortInFlightRequests,
} from "../../request.js";
import {applyAbortablePromisesPatch} from "./apply-abortable-promises-patch.js";

/**
 * A ResourceLoader implementation for JSDOM sixteen-compatible versions of
 * JSDOM that only allows for fetching JS files.
 *
 * A JS file request is identified by the regular expression:
 *   /^.*\.js(?:\?.*)?/g
 */
export class JSDOMSixteenResourceLoader extends ResourceLoader {
    /**
     * Used to indicate if any pending requests are still needed so that we
     * can report when an unused request is fulfilled.
     */
    _active: boolean;
    _renderAPI: RenderAPI;
    _requestOptions: RequestOptions;

    static get EMPTY_RESPONSE(): Promise<Buffer> {
        return Promise.resolve(Buffer.from(""));
    }

    /**
     * Create instance of the resource loader.
     *
     * @param {RequestFn} requestFn
     * The function responsibly for fulfilling GET requests for URLs.
     */
    constructor(
        renderAPI: RenderAPI,
        requestOptions?: RequestOptions = DefaultRequestOptions,
    ) {
        // Patch before super to make sure promises get an abort.
        applyAbortablePromisesPatch();

        super();

        if (renderAPI == null) {
            throw new Error("Must provide render API.");
        }

        this._active = true;
        this._renderAPI = renderAPI;
        this._requestOptions = requestOptions;
    }

    get isActive(): boolean {
        return this._active;
    }

    close(): void {
        this._active = false;
        abortInFlightRequests();
    }

    fetch(url: string, options?: FetchOptions): ?Promise<Buffer> {
        const logger = this._renderAPI.logger;
        const isInlineData = url.startsWith("data:");
        const readableURLForLogging = isInlineData ? "inline data" : url;
        if (!this._active) {
            /**
             * If we get here, then something is trying to fetch when our
             * environment has closed us down. This could be in the reject
             * or resolve of a promise, for example.
             *
             * If it's inlinedata, it really doesn't matter, so let's log it
             * only if it's for a file.
             */
            if (!isInlineData) {
                logger.warn(
                    `File fetch attempted after resource loader close: ${readableURLForLogging}`,
                );
            }

            /**
             * Though we intentionally don't want to load this file, we can't
             * just return null per the spec as this can break promise
             * resolutions that are relying on this file. Instead, we resolve
             * as an empty string so things can tidy up properly.
             */
            return JSDOMSixteenResourceLoader.EMPTY_RESPONSE;
        }

        /**
         * We must still be active.
         * If this request is not a JavaScript file, we are going to return an
         * empty response as we don't care about non-JS resources.
         */
        const JSFileRegex = /^.*\.js(?:\?.*)?/g;
        if (!JSFileRegex.test(url)) {
            logger.silly(`EMPTY: ${readableURLForLogging}`);

            /**
             * Though we intentionally don't want to load this file, we can't
             * just return null per the spec as this can break promise
             * resolutions that are relying on this file. Instead, we resolve
             * as an empty string so things can tidy up properly.
             */
            return JSDOMSixteenResourceLoader.EMPTY_RESPONSE;
        }

        /**
         * This must be a JavaScript file request. Let's make a request for the
         * file and then handle it coming back.
         */
        const abortableFetch = request(logger, url, {
            ...this._requestOptions,
            agent: getAgentForURL(new URL(url)),
        });
        const handleInactive = abortableFetch.then((response) => {
            if (!this._active) {
                logger.silly(
                    `File requested but never used: ${readableURLForLogging}`,
                );

                /**
                 * Just return an empty buffer so no code executes. The
                 * request function passed at construction will have handled
                 * caching of the real file request.
                 */
                return Buffer.from("");
            }
            return Buffer.from(response.text);
        });

        /**
         * We have to turn this back into an abortable promise so that JSDOM
         * can abort it when closing, if it needs to.
         */
        (handleInactive: any).abort = abortableFetch.abort;
        return handleInactive;
    }
}
