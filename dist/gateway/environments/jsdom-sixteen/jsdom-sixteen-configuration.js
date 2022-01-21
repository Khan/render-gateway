"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSDOMSixteenConfiguration = void 0;

var _index = require("../../../shared/index.js");

var _index2 = require("../../../ka-shared/index.js");

/**
 * Utility for creating a valid configuration to use with the JSDOM Sixteen
 * environment.
 */
class JSDOMSixteenConfiguration {
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
   * @param {(url: string, fileURLs: $ReadOnlyArray<string>, renderAPI: RenderAPI, vmContext: any) => ?Promise<mixed>} [afterEnvSetup]
   * Callback to perform additional environment setup before the render
   * occurs. This can optionally return an object that can add extra fields
   * to the environment context for rendering code to access. This is useful
   * if your render server wants to add some specific configuration, such
   * as setting up some versions of Apollo for server-side rendering.
   * Be careful; any functions you attach can be executed by the rendering
   * code.
   * @param {string} [registrationCallbackName] The name of the function
   * that the environment should expose for client code to register for
   * rendering. This defaults to `__jsdom_env_register`.
   */
  constructor(getFileList, getResourceLoader, afterEnvSetup, registrationCallbackName = "__jsdom_env_register") {
    if (typeof getFileList !== "function") {
      throw new _index.KAError("Must provide valid callback for obtaining file list", _index2.Errors.Internal);
    }

    if (typeof getResourceLoader !== "function") {
      throw new _index.KAError("Must provide valid callback for obtaining resource loader", _index2.Errors.Internal);
    }

    if (afterEnvSetup != null && typeof afterEnvSetup !== "function") {
      throw new _index.KAError("Must provide valid callback for after env setup or null", _index2.Errors.Internal);
    }

    this.registrationCallbackName = registrationCallbackName;
    this.getFileList = getFileList;
    this.getResourceLoader = getResourceLoader;

    this.afterEnvSetup = afterEnvSetup || (() => Promise.resolve(null));
  }

}

exports.JSDOMSixteenConfiguration = JSDOMSixteenConfiguration;
//# sourceMappingURL=jsdom-sixteen-configuration.js.map