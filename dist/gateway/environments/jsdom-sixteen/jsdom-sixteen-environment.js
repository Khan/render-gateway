"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSDOMSixteenEnvironment = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
      const traceSession = renderAPI.trace("_retrieveTargetFiles");

      try {
        /**
         * First, we need to know what files to execute so that we can produce
         * a render result, and we need a resource loader so that we can
         * retrieve those files as well as support retrieving additional files
         * within our JSDOM environment.
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


          return fetchResult.then(b => b.toString());
        }));
      } finally {
        traceSession.end();
      }
    });

    _defineProperty(this, "render", async (url, renderAPI) => {
      /**
       * We are going to need a resource loader so that we can obtain files
       * both inside and outside the JSDOM VM.
       */
      const resourceLoader = this._configuration.getResourceLoader(url, renderAPI); // eslint-disable-next-line no-unused-vars


      const files = await this._retrieveTargetFiles(url, renderAPI, resourceLoader);
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
        status: 200
      });
    });

    if (configuration == null) {
      throw new Error("Must provide environment configuration");
    }

    this._configuration = configuration;
  }

}

exports.JSDOMSixteenEnvironment = JSDOMSixteenEnvironment;
//# sourceMappingURL=jsdom-sixteen-environment.js.map