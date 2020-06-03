// @flow
import {Script} from "vm";
import {JSDOM} from "jsdom";
import {createVirtualConsole} from "./create-virtual-console.js";
import {patchAgainstDanglingTimers} from "./patch-against-dangling-timers.js";
import type {
    IJSDOMSixteenConfiguration,
    CloseableResourceLoader,
    IGate,
    ICloseable,
} from "./types.js";
import type {IRenderEnvironment, RenderAPI, RenderResult} from "../../types.js";

interface RenderCallbackFn {
    /**
     * Method invoked to create a render result.
     */
    (): Promise<RenderResult>;
}

/**
 * A JS file.
 */
type JavaScriptFile = {
    /**
     * The content of the file.
     */
    +content: string,

    /**
     * The URL of the file.
     */
    +url: string,
};

type JavaScriptFiles = {
    +files: $ReadOnlyArray<JavaScriptFile>,
    +urls: $ReadOnlyArray<string>,
};

const MinimalPage = "<!DOCTYPE html><html><head></head><body></body></html>";

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

    _retrieveTargetFiles: (
        url: string,
        renderAPI: RenderAPI,
        resourceLoader: CloseableResourceLoader,
    ) => Promise<JavaScriptFiles> = async (
        url: string,
        renderAPI: RenderAPI,
        resourceLoader: CloseableResourceLoader,
    ): Promise<JavaScriptFiles> => {
        const traceSession = renderAPI.trace(
            "JSDOM16._retrieveTargetFiles",
            `JSDOMSixteenEnvironment retrieving files`,
        );
        try {
            /**
             * First, we need to know what files to execute so that we can
             * produce a render result, and we need a resource loader so that
             * we can retrieve those files as well as support retrieving
             * additional files within our JSDOM environment.
             */
            const fileURLs = await this._configuration.getFileList(
                url,
                renderAPI,
            );
            traceSession.addLabel("fileCount", fileURLs.length);

            /**
             * Now let's use the resource loader to get the files.
             * We ignore the `FetchOptions` param of resourceLoader.fetch as we
             * have nothing to pass there.
             */
            return {
                files: await Promise.all(
                    fileURLs.map((f) => {
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
                        return fetchResult.then((b) => ({
                            content: b.toString(),
                            url: f,
                        }));
                    }),
                ),
                urls: fileURLs,
            };
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
    render: (
        url: string,
        renderAPI: RenderAPI,
    ) => Promise<RenderResult> = async (
        url: string,
        renderAPI: RenderAPI,
    ): Promise<RenderResult> => {
        /**
         * We want to tidy up nicely if there's a problem and also if the render
         * context is closed, so let's handle that by putting closeable things
         * into a handy list and providing a way to close them all.
         */
        const closeables: Array<ICloseable> = [];
        const closeAll = () =>
            new Promise((resolve) => {
                /**
                 * We wrap this in a timeout to hopefully mitigate any changes
                 * of https://github.com/jsdom/jsdom/issues/1682
                 */
                setTimeout(() => {
                    /**
                     * We want to close things in reverse, just to be sure we
                     * tidy up in the same order that we put things together.
                     */
                    for (let i = closeables.length - 1; i >= 0; i--) {
                        // eslint-disable-next-line flowtype/no-unused-expressions
                        closeables[i]?.close?.();
                    }
                    resolve();
                });
            });

        try {
            /**
             * We are going to need a resource loader so that we can obtain files
             * both inside and outside the JSDOM VM.
             */
            const resourceLoader = this._configuration.getResourceLoader(
                url,
                renderAPI,
            );

            // Let's get those files!
            const files = await this._retrieveTargetFiles(
                url,
                renderAPI,
                resourceLoader,
            );

            /**
             * We want a JSDOM instance for the url we want to render. This is
             * where we setup custom resource loading and our virtual console
             * too.
             */
            const jsdomInstance = new JSDOM(MinimalPage, {
                url,
                runScripts: "dangerously",
                resources: (resourceLoader: any),
                pretendToBeVisual: true,
                virtualConsole: createVirtualConsole(renderAPI.logger),
            });
            closeables.push(jsdomInstance.window);

            /**
             * OK, we know this is a JSDOM instance but we want to expose a nice
             * wrapper. As part of that wrapper, we want to make it easier to
             * run scripts (like our rendering JS code) within the VM context.
             * So, let's create a helper for that.
             *
             * We cast the context to any, because otherwise it is typed as an
             * empty object, which makes life annoying.
             */
            const vmContext: any = jsdomInstance.getInternalVMContext();
            const runScript = (
                script: string,
                options?: vm$ScriptOptions,
            ): any => {
                const realScript = new Script(script, options);
                return realScript.runInContext(vmContext);
            };

            /**
             * Next, we want to patch timers so we can make sure they don't
             * fire after we are done (and so we can catch dangling timers if
             * necessary). To do this, we are going to hang the timer API off
             * the vmContext and then execute it from inside the context.
             * Super magic.
             */
            const tmpFnName = "__tmp_patchTimers";
            vmContext[tmpFnName] = patchAgainstDanglingTimers;
            const timerGateAPI: IGate = runScript(`${tmpFnName}(window);`);
            delete vmContext[tmpFnName];
            closeables.push(timerGateAPI);

            /**
             * At this point, we give our configuration an opportunity to
             * modify the render context and capture the return result, which
             * can be used to tidy up after we're done.
             */
            const afterRenderTidyUp = await this._configuration.afterEnvSetup(
                url,
                files.urls,
                renderAPI,
                vmContext,
            );
            closeables.push(afterRenderTidyUp);

            /**
             * At this point, before loading the files for rendering, we must
             * configure the registration point in our render context.
             */
            const {registrationCallbackName} = this._configuration;
            const registeredCbName = "__registeredCallback";
            vmContext[registrationCallbackName] = (
                cb: RenderCallbackFn,
            ): void => {
                vmContext[registrationCallbackName][registeredCbName] = cb;
            };

            /**
             * The context is configured. Now we need to load the files into it
             * which should cause our registration callback to be invoked.
             * We pass the filename here so we can get some nicer stack traces.
             */
            for (const {content, url} of files.files) {
                runScript(content, {filename: url});
            }

            /**
             * With the files all loaded, we should have a registered callback.
             * Let's assert that and then invoke the render process.
             */
            if (
                typeof vmContext[registrationCallbackName][registeredCbName] !==
                "function"
            ) {
                throw new Error("No render callback was registered.");
            }

            /**
             * And now we run the registered callback inside the VM.
             */
            const result: RenderResult = await runScript(`
    const cb = window["${registrationCallbackName}"]["${registeredCbName}"];
    cb();`);

            /**
             * Let's make sure that the rendered function returned something
             * resembling a render result.
             */
            if (
                result == null ||
                !Object.prototype.hasOwnProperty.call(result, "body") ||
                !Object.prototype.hasOwnProperty.call(result, "status") ||
                !Object.prototype.hasOwnProperty.call(result, "headers")
            ) {
                throw new Error(
                    `Malformed render result: ${JSON.stringify(result)}`,
                );
            }

            /**
             * After all that, we should have a result, so let's return it and
             * let our finally tidy up all the render context we built.
             */
            return result;
        } finally {
            /**
             * We need to make sure that whatever happens, we tidy everything
             * up.
             */
            await closeAll();
        }
    };
}
