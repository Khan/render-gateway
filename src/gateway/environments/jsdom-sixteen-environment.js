// @flow
import type {ResourceLoader} from "jsdom";

import {applyAbortablePromisesPatch} from "./apply-abortable-promises-patch.js";

import type {IRenderEnvironment, RenderAPI, RenderResult} from "../types.js";

interface getResourceLoader {
    /**
     * Get a JSDOM resource loader for the given render request.
     *
     * @param {string} url The URL that is to be rendered. This is always
     * relative to the host and so does not contain protocol, hostname, nor port
     * information.
     * @param {RenderAPI} renderAPI An API of utilities for assisting with the
     * render operation.
     * @returns {ResourceLoader} A ResourceLoader instance for use with JSDOM.
     */
    (url: string, renderAPI: RenderAPI): ResourceLoader;
}

interface getFileList {
    /**
     * Get the list of file URLs to retrieve and execute for the given request.
     *
     * @param {string} url The URL that is to be rendered. This is always
     * relative to the host and so does not contain protocol, hostname, nor port
     * information.
     * @param {RenderAPI} renderAPI An API of utilities for assisting with the
     * render operation.
     * @returns {Promise<Array<string>>} An ordered array of absolute URLs for
     * the JavaScript files that are to be executed. These are exectued in the
     * same order as the array.
     */
    (url: string, renderAPI: RenderAPI): Promise<Array<string>>;
}

/**
 * A render environment built to support the JSDOM 16.x API.
 */
export class JSDOMSixteenEnvironment implements IRenderEnvironment {
    _getFileListFn: getFileList;
    _getResourceLoaderFn: getResourceLoader;

    /**
     * Create a new instance of this environment.
     *
     * @param {getFileList} getFileListFn
     * Callback that should return a promise for the list of JavaScript files
     * the environment must execute in order to produce a result for the given
     * render request.
     * @param {getResourceLoader} getResourceLoaderFn
     * Callback that should return a JSDOM resource loader for the given
     * request. We must call this per render so that logging is appropriately
     * channeled for the request being made.
     */
    constructor(
        getFileListFn: getFileList,
        getResourceLoaderFn: getResourceLoader,
    ) {
        if (getFileListFn == null) {
            throw new Error("Must provide callback for obtaining file list");
        }
        if (getResourceLoaderFn == null) {
            throw new Error(
                "Must provide callback for obtaining resource loader",
            );
        }
        this._getFileListFn = getFileListFn;
        this._getResourceLoaderFn = getResourceLoaderFn;

        applyAbortablePromisesPatch();
    }

    /**
     * Generate a render result for the given url.
     *
     * @param {string} url The URL that is to be rendered. This is always
     * relative to the host and so does not contain protocol, hostname, nor port
     * information.
     * @param {RenderAPI} renderAPI An API of utilities for assisting with the
     * render operation.
     * @returns {Promise<RenderResult>} The result of the render that is to be
     * returned by the gateway service as the response to the render request.
     * This includes the body of the response and the status code information.
     */
    render = async (
        url: string,
        renderAPI: RenderAPI,
    ): Promise<RenderResult> => {
        /**
         * First, we need to know what files to execute so that we can produce
         * a render result, and we need a resource loader so that we can
         * retrieve those files as well as support retrieving additional files
         * within our JSDOM environment.
         */
        const files = await this._getFileListFn(url, renderAPI);
        const resourceLoader = this._getResourceLoaderFn(url, renderAPI);

        /**
         * Now let's use the resource loader to get the files.
         * We ignore the `FetchOptions` param of resourceLoader.fetch as we
         * have nothing to pass there.
         */
        // eslint-disable-next-line no-unused-vars
        const packages = await Promise.all(
            files.map((f) => resourceLoader.fetch(f).then((b) => b.toString())),
        );

        /**
         * Right, we have the files. Now we need the JSDOM environment and the
         * rendering hooks so that we can make a render happen.
         */

        return Promise.resolve({
            body: "NOTHING",
            headers: {},
            status: 200,
        });
    };
}
