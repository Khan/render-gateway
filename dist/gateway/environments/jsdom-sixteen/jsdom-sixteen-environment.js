"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSDOMSixteenEnvironment = void 0;

var _vm = require("vm");

var _jsdom = require("jsdom");

var _createVirtualConsole = require("./create-virtual-console.js");

var _patchAgainstDanglingTimers = require("./patch-against-dangling-timers.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const MinimalPage = "<!DOCTYPE html><html><head></head><body></body></html>";
/**
 * A render environment built to support the JSDOM 16.x API.
 */

class JSDOMSixteenEnvironment {
  /**
   * Create a new instance of this environment.
   *
   * @param {IJSDOMSixteenConfiguration} configuration
   * Configuration for the environment.
   */
  constructor(configuration) {
    _defineProperty(this, "_configuration", void 0);

    _defineProperty(this, "_retrieveTargetFiles", async (url, renderAPI, resourceLoader) => {
      const traceSession = renderAPI.trace("JSDOM16._retrieveTargetFiles", `JSDOMSixteenEnvironment retrieving files`);

      try {
        /**
         * First, we need to know what files to execute so that we can
         * produce a render result, and we need a resource loader so that
         * we can retrieve those files as well as support retrieving
         * additional files within our JSDOM environment.
         */
        const files = await this._configuration.getFileList(url, renderAPI);
        traceSession.addLabel("fileCount", files.length);
        /**
         * Now let's use the resource loader to get the files.
         * We ignore the `FetchOptions` param of resourceLoader.fetch as we
         * have nothing to pass there.
         */

        return await Promise.all(files.map(f => {
          const fetchResult = resourceLoader.fetch(f);
          /**
           * Resource loader's fetch can return null. It shouldn't for
           * any of these files though, so if it does, let's raise an
           * error!
           */

          if (fetchResult == null) {
            throw new Error(`Unable to retrieve ${f}. ResourceLoader returned null.`);
          }
          /**
           * No need to reconnect the abort() in this case since we
           * won't be calling it.
           */


          return fetchResult.then(b => ({
            content: b.toString(),
            url: f
          }));
        }));
      } finally {
        traceSession.end();
      }
    });

    _defineProperty(this, "render", async (url, renderAPI) => {
      /**
       * We want to tidy up nicely if there's a problem and also if the render
       * context is closed, so let's handle that by putting closeable things
       * into a handy list and providing a way to close them all.
       */
      const closeables = [];

      const closeAll = () => {
        for (const closeable of closeables) {
          var _closeable$close;

          // eslint-disable-next-line flowtype/no-unused-expressions
          closeable === null || closeable === void 0 ? void 0 : (_closeable$close = closeable.close) === null || _closeable$close === void 0 ? void 0 : _closeable$close.call(closeable);
        }
      };

      try {
        /**
         * We are going to need a resource loader so that we can obtain files
         * both inside and outside the JSDOM VM.
         */
        const resourceLoader = this._configuration.getResourceLoader(url, renderAPI); // Let's get those files!


        const files = await this._retrieveTargetFiles(url, renderAPI, resourceLoader);
        /**
         * We want a JSDOM instance for the url we want to render. This is
         * where we setup custom resource loading and our virtual console
         * too.
         */

        const jsdomInstance = new _jsdom.JSDOM(MinimalPage, {
          url,
          runScripts: "dangerously",
          resources: resourceLoader,
          pretendToBeVisual: true,
          virtualConsole: (0, _createVirtualConsole.createVirtualConsole)(renderAPI.logger)
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

        const vmContext = jsdomInstance.getInternalVMContext();

        const runScript = (script, options) => {
          const realScript = new _vm.Script(script, options);
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
        vmContext[tmpFnName] = _patchAgainstDanglingTimers.patchAgainstDanglingTimers;
        const timerGateAPI = runScript(`${tmpFnName}(window);`);
        delete vmContext[tmpFnName];
        closeables.push(timerGateAPI);
        /**
         * At this point, we give our configuration an opportunity to
         * modify the render context.
         */

        await this._configuration.afterEnvSetup(url, renderAPI, vmContext);
        /**
         * At this point, before loading the files for rendering, we must
         * configure the registration point in our render context.
         */

        const {
          registrationCallbackName
        } = this._configuration;
        const registeredCbName = "__registeredCallback";

        vmContext[registrationCallbackName] = cb => {
          vmContext[registrationCallbackName][registeredCbName] = cb;
        };
        /**
         * The context is configured. Now we need to load the files into it
         * which should cause our registration callback to be invoked.
         * We pass the filename here so we can get some nicer stack traces.
         */


        for (const {
          content,
          url
        } of files) {
          runScript(content, {
            filename: url
          });
        }
        /**
         * With the files all loaded, we should have a registered callback.
         * Let's assert that and then invoke the render process.
         */


        if (typeof vmContext[registrationCallbackName][registeredCbName] !== "function") {
          throw new Error("No render callback was registered.");
        }
        /**
         * We are finally ready. Before we can invoke the render, we need
         * to make sure our render API pieces are made available to the
         * render callback, so we attach them in the vm context.
         */


        const renderAPIName = "__renderAPI";
        vmContext[registrationCallbackName][renderAPIName] = {
          trace: renderAPI.trace,
          getHeader: renderAPI.getHeader
        };
        /**
         * And now we run the registered callback inside the VM, passing
         * the render API pieces we just provided.
         */

        const result = await runScript(`
    const cb = window["${registrationCallbackName}"]["${registeredCbName}"];
    const {trace, getHeader} = window["${registrationCallbackName}"]["${renderAPIName}"];
    cb(getHeader, trace);`);
        /**
         * Let's make sure that the rendered function returned something
         * resembling a render result.
         */

        if (result == null || !Object.prototype.hasOwnProperty.call(result, "body") || !Object.prototype.hasOwnProperty.call(result, "status") || !Object.prototype.hasOwnProperty.call(result, "headers")) {
          throw new Error(`Malformed render result: ${JSON.stringify(result)}`);
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
        closeAll();
      }
    });

    if (configuration == null) {
      throw new Error("Must provide environment configuration");
    }

    this._configuration = configuration;
  }

}

exports.JSDOMSixteenEnvironment = JSDOMSixteenEnvironment;
//# sourceMappingURL=jsdom-sixteen-environment.js.map