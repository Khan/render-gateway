// @flow
import type {ResourceLoader} from "jsdom";
import type {RenderAPI} from "../../types.js";

/**
 * Gate API for control flow.
 */
export interface IGate {
    /**
     * Open the gate.
     */
    open(): void;

    /**
     * Close the gate.
     */
    close(): void;

    /**
     * True, if the gate is open; otherwise, false.
     */
    get isOpen(): boolean;
}

/**
 * Standard timer API as implemented by Node's global or a browser window.
 */
export interface ITimerAPI {
    setTimeout: $PropertyType<window, "setTimeout">;
    setInterval: $PropertyType<window, "setInterval">;
    requestAnimationFrame: $PropertyType<window, "requestAnimationFrame">;
}

/**
 * Configuration for a JSDOM Sixteen environment.
 */
export interface IJSDOMSixteenConfiguration {
    /**
     * Get a JSDOM resource loader for the given render request.
     *
     * @param {string} url The URL that is to be rendered.
     * @param {RenderAPI} renderAPI An API of utilities for assisting with the
     * render operation.
     * @returns {ResourceLoader} A ResourceLoader instance for use with JSDOM.
     */
    getResourceLoader(url: string, renderAPI: RenderAPI): ResourceLoader;

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
    getFileList(url: string, renderAPI: RenderAPI): Promise<Array<string>>;

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
    afterEnvSetup(url: string, renderAPI: RenderAPI): ?Promise<mixed>;
}
