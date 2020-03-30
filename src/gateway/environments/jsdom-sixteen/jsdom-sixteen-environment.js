// @flow
import type {ResourceLoader} from "jsdom";

import {applyAbortablePromisesPatch} from "./apply-abortable-promises-patch.js";

import type {IRenderEnvironment, RenderAPI, RenderResult} from "../../types.js";

interface GetResourceLoaderFn {
    /**
     * Get a JSDOM resource loader for the given render request.
     *
     * @param {string} url The URL that is to be rendered.
     * @param {RenderAPI} renderAPI An API of utilities for assisting with the
     * render operation.
     * @returns {ResourceLoader} A ResourceLoader instance for use with JSDOM.
     */
    (url: string, renderAPI: RenderAPI): ResourceLoader;
}

interface GetFileListFn {
    /**
     * Get the list of file URLs to retrieve and execute for the given request.
     *
     * @param {string} url The URL that is to be rendered.
     * @param {RenderAPI} renderAPI An API of utilities for assisting with the
     * render operation.
     * @returns {Promise<Array<string>>} An ordered array of absolute URLs for
     * the JavaScript files that are to be executed. These are exectued in the
     * same order as the array.
     */
    (url: string, renderAPI: RenderAPI): Promise<Array<string>>;
}

interface AfterEnvSetupFn {
    /**
     * Perform any additional environment setup.
     *
     * @param {string} url The URL that is to be rendered.
     * @param {RenderAPI} renderAPI An API of utilities for assisting with the
     * render operation.
     * @returns {?Promise<mixed>} The promise of an object with additional
     * fields to be copied to the global of the render enviroment. These
     * values will be therefore available to any code that runs inside the
     * environment when the render occuras.
     */
    (url: string, renderAPI: RenderAPI): ?Promise<mixed>;
}

/**
 * A render environment built to support the JSDOM 16.x API.
 */
export class JSDOMSixteenEnvironment implements IRenderEnvironment {
    _getFileListFn: GetFileListFn;
    _getResourceLoaderFn: GetResourceLoaderFn;

    /**
     * Create a new instance of this environment.
     *
     * @param {GetFileListFn} getFileListFn
     * Callback that should return a promise for the list of JavaScript files
     * the environment must execute in order to produce a result for the given
     * render request.
     * @param {GetResourceLoaderFn} getResourceLoaderFn
     * Callback that should return a JSDOM resource loader for the given
     * request. We must call this per render so that logging is appropriately
     * channeled for the request being made.
     * @param {AfterEnvSetupFn} [afterEnvSetup]
     * Callback to perform additional environment setup before the render
     * occurs. This can optionally return an object that can add extra fields
     * to the environment context for rendering code to access. This is useful
     * if your render server wants to add some specific configuration, such
     * as setting up some versions of Apollo for server-side rendering.
     */
    constructor(
        getFileListFn: GetFileListFn,
        getResourceLoaderFn: GetResourceLoaderFn,
        afterEnvSetup?: AfterEnvSetupFn,
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

    _retrieveTargetFiles = async (
        url: string,
        renderAPI: RenderAPI,
    ): Promise<Array<string>> => {
        const traceSession = renderAPI.trace("Retrieving target files");
        try {
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
            return await Promise.all(
                files.map((f) => {
                    const fetchResult = resourceLoader.fetch(f);
                    /**
                     * Resource loader's fetch can return null. It shouldn't for
                     * any of these files though, so if it does, let's raise an
                     * error!
                     */
                    if (fetchResult == null) {
                        throw new Error(
                            `Unable to retrieve ${f}. ResourceLoader returned null.`,
                        );
                    }
                    /**
                     * No need to reconnect the abort() in this case since we
                     * won't be calling it.
                     */
                    return fetchResult.then((b) => b.toString());
                }),
            );
        } finally {
            traceSession.end();
        }
    };

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
        // eslint-disable-next-line no-unused-vars
        const files = await this._retrieveTargetFiles(url, renderAPI);

        /**
         * Right, we have the files. Now we need the JSDOM environment and the
         * rendering hooks so that we can make a render happen.
         */
        /**
         * 1. Need to setup the JSDOM VM
         *    - see createRenderContext for RRS
         *    - call the afterEnvSetup and attach anything it returns to the
         *      vm context
         *
         * 2. Need to setup the environment with render registration callbacks
         *    - see the render function in render.js of RRS
         *
         * 3. Invoke the render and return its result.
         *
         * 4. Finally, close the JSDOM environment.
         */
        // TODO(somewhatabstract): All the things

        return Promise.resolve({
            body: "NOTHING",
            headers: {},
            status: 200,
        });
    };
}
