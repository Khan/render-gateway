// @flow
import type {IJSDOMSixteenConfiguration} from "./types.js";

/**
 * Utility for creating a valid configuration to use with the JSDOM Sixteen
 * environment.
 */
export class JSDOMSixteenConfiguration implements IJSDOMSixteenConfiguration {
    +getFileList: $PropertyType<IJSDOMSixteenConfiguration, "getFileList">;
    +getResourceLoader: $PropertyType<
        IJSDOMSixteenConfiguration,
        "getResourceLoader",
    >;
    +afterEnvSetup: $PropertyType<IJSDOMSixteenConfiguration, "afterEnvSetup">;

    /**
     * Create a configuration for use with the JSDOM Sixteen environment.
     *
     * @param {(url: string, renderAPI: RenderAPI) => Promise<Array<string>>} getFileList
     * Callback that should return a promise for the list of JavaScript files
     * the environment must execute in order to produce a result for the given
     * render request.
     * @param {(url: string, renderAPI: RenderAPI) => ResourceLoader} getResourceLoader
     * Callback that should return a JSDOM resource loader for the given
     * request. We must call this per render so that logging is appropriately
     * channeled for the request being made.
     * @param {(url: string, renderAPI: RenderAPI) => ?Promise<mixed>} [afterEnvSetup]
     * Callback to perform additional environment setup before the render
     * occurs. This can optionally return an object that can add extra fields
     * to the environment context for rendering code to access. This is useful
     * if your render server wants to add some specific configuration, such
     * as setting up some versions of Apollo for server-side rendering.
     */
    constructor(
        getFileList: $PropertyType<IJSDOMSixteenConfiguration, "getFileList">,
        getResourceLoader: $PropertyType<
            IJSDOMSixteenConfiguration,
            "getResourceLoader",
        >,
        afterEnvSetup?: $PropertyType<
            IJSDOMSixteenConfiguration,
            "afterEnvSetup",
        >,
    ) {
        if (typeof getFileList !== "function") {
            throw new Error(
                "Must provide valid callback for obtaining file list",
            );
        }
        if (typeof getResourceLoader !== "function") {
            throw new Error(
                "Must provide valid callback for obtaining resource loader",
            );
        }
        if (afterEnvSetup != null && typeof afterEnvSetup !== "function") {
            throw new Error(
                "Must provide valid callback for after env setup or null",
            );
        }

        this.getFileList = getFileList;
        this.getResourceLoader = getResourceLoader;
        this.afterEnvSetup = afterEnvSetup || (() => null);
    }
}
