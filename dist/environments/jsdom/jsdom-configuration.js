"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSDOMConfiguration = void 0;
var _wonderStuffCore = require("@khanacademy/wonder-stuff-core");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Utility for creating a valid configuration to use with the JSDOM environment.
 */
class JSDOMConfiguration {
  /**
   * Create a configuration for use with the JSDOM  environment.
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
    _defineProperty(this, "registrationCallbackName", void 0);
    _defineProperty(this, "getFileList", void 0);
    _defineProperty(this, "getResourceLoader", void 0);
    _defineProperty(this, "afterEnvSetup", void 0);
    if (typeof getFileList !== "function") {
      throw new _wonderStuffCore.KindError("Must provide valid callback for obtaining file list", _wonderStuffCore.Errors.Internal);
    }
    if (typeof getResourceLoader !== "function") {
      throw new _wonderStuffCore.KindError("Must provide valid callback for obtaining resource loader", _wonderStuffCore.Errors.Internal);
    }
    if (afterEnvSetup != null && typeof afterEnvSetup !== "function") {
      throw new _wonderStuffCore.KindError("Must provide valid callback for after env setup or null", _wonderStuffCore.Errors.Internal);
    }
    this.registrationCallbackName = registrationCallbackName;
    this.getFileList = getFileList;
    this.getResourceLoader = getResourceLoader;
    this.afterEnvSetup = afterEnvSetup || (() => Promise.resolve(null));
  }
}
exports.JSDOMConfiguration = JSDOMConfiguration;
//# sourceMappingURL=jsdom-configuration.js.map