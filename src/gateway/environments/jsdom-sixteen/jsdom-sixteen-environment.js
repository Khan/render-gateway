// @flow
import type {ResourceLoader} from "jsdom";
import type {IJSDOMSixteenConfiguration} from "./index.js";
import type {IRenderEnvironment, RenderAPI, RenderResult} from "../../types.js";

/**
 * A render environment built to support the JSDOM 16.x API.
 */
export class JSDOMSixteenEnvironment implements IRenderEnvironment {
    _configuration: IJSDOMSixteenConfiguration;

    /**
     * Create a new instance of this environment.
     *
     * @param {IJSDOMSixteenConfiguration} configuration
     * Configuration for the environment.
     */
    constructor(configuration: IJSDOMSixteenConfiguration) {
        if (configuration == null) {
            throw new Error("Must provide environment configuration");
        }
        this._configuration = configuration;
    }

    _retrieveTargetFiles = async (
        url: string,
        renderAPI: RenderAPI,
        resourceLoader: ResourceLoader,
    ): Promise<Array<string>> => {
        const traceSession = renderAPI.trace("Retrieving target files");
        try {
            /**
             * First, we need to know what files to execute so that we can produce
             * a render result, and we need a resource loader so that we can
             * retrieve those files as well as support retrieving additional files
             * within our JSDOM environment.
             */
            const files = await this._configuration.getFileList(url, renderAPI);

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
        /**
         * We are going to need a resource loader so that we can obtain files
         * both inside and outside the JSDOM VM.
         */
        const resourceLoader = this._configuration.getResourceLoader(
            url,
            renderAPI,
        );

        // eslint-disable-next-line no-unused-vars
        const files = await this._retrieveTargetFiles(
            url,
            renderAPI,
            resourceLoader,
        );

        /**
         * Right, we have the files. Now we need the JSDOM environment and the
         * rendering hooks so that we can make a render happen.
         */
        /**
         * TODO(somewhatabstract): All the things
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

        return Promise.resolve({
            body: "NOTHING",
            headers: {},
            status: 200,
        });
    };
}
