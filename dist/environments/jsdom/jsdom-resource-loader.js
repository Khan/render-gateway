"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSDOMResourceLoader = void 0;
var _url = require("url");
var _jsdom = require("jsdom");
var _wonderStuffServer = require("@khanacademy/wonder-stuff-server");
var _wonderStuffCore = require("@khanacademy/wonder-stuff-core");
var _request = require("../../request.js");
var _applyAbortablePromisesPatch = require("./apply-abortable-promises-patch.js");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * A ResourceLoader implementation for JSDOM that only allows for fetching JS
 * files, and provides the ability to handle and modify the fetch return result.
 *
 * This can be useful for various things, such as intercepting script requests
 * to execute them in a different manner than letting the DOM use a script tag.
 * The return result could then be an empty string rather than the full script.
 *
 * The caller is responsible for maintaining script order based on call order.
 *
 * A JS file request is identified by the regular expression:
 *   /^.*\.js(?:\?.*)?/g
 */
class JSDOMResourceLoader extends _jsdom.ResourceLoader {
  /**
   * Used to indicate if any pending requests are still needed so that we
   * can report when an unused request is fulfilled.
   */

  static get EMPTY_RESPONSE() {
    return Promise.resolve(Buffer.from(""));
  }

  /**
   * Create instance of the resource loader.
   *
   * @param {RenderAPI} RenderAPI The render API that provides things like
   * the logger.
   * @param {RequestOptions} [requestOptions] Options that calibrate how
   * requests are performed for this loader.
   * @param {(result: ?Promise<Buffer>, url: string, options?: FetchOptions) => ?Promise<Buffer>}
   * A callback that is invoked with the promise result. This can be used
   * to ensure additional work is done on each request within the loader
   * cycle, before the JSDOM call receives the result.
   */
  constructor(renderAPI, requestOptions = _request.DefaultRequestOptions, handleFetchResult) {
    // Patch before super to make sure promises get an abort.
    (0, _applyAbortablePromisesPatch.applyAbortablePromisesPatch)();
    super();
    _defineProperty(this, "_active", void 0);
    _defineProperty(this, "_renderAPI", void 0);
    _defineProperty(this, "_requestOptions", void 0);
    _defineProperty(this, "_agents", void 0);
    _defineProperty(this, "_handleFetchResult", void 0);
    if (renderAPI == null) {
      throw new _wonderStuffCore.KindError("Must provide render API.", _wonderStuffCore.Errors.Internal);
    }
    this._active = true;
    this._renderAPI = renderAPI;
    this._requestOptions = requestOptions;
    this._agents = {};
    this._handleFetchResult = handleFetchResult;
  }
  _getAgent(url) {
    const parsedURL = new _url.URL(url);
    const agent = this._agents[parsedURL.protocol] || (0, _wonderStuffServer.getAgentForURL)(parsedURL);
    this._agents[parsedURL.protocol] = agent;
    return agent;
  }
  get isActive() {
    return this._active;
  }
  close() {
    this._active = false;

    /**
     * We need to destroy any agents we created or they may retain
     * sockets that retain references to our JSDOM environment and cause
     * a memory leak.
     */
    for (const key of Object.keys(this._agents)) {
      this._agents[key].destroy();
      delete this._agents[key];
    }
  }
  fetch(url, options) {
    const logger = this._renderAPI.logger;
    const isInlineData = url.startsWith("data:");
    const readableURLForLogging = isInlineData ? "inline data" : url;
    if (!this._active) {
      /**
       * If we get here, then something is trying to fetch when our
       * environment has closed us down. This could be in the reject
       * or resolve of a promise, for example.
       *
       * If it's inlinedata, it really doesn't matter, so let's log it
       * only if it's for a file.
       */
      if (!isInlineData) {
        logger.warn(`File fetch attempted after resource loader close: ${readableURLForLogging}`);
      }

      /**
       * Though we intentionally don't want to load this file, we can't
       * just return null per the spec as this can break promise
       * resolutions that are relying on this file. Instead, we resolve
       * as an empty string so things can tidy up properly.
       */
      return JSDOMResourceLoader.EMPTY_RESPONSE;
    }

    /**
     * We must still be active.
     * If this request is not a JavaScript file, we are going to return an
     * empty response as we don't care about non-JS resources.
     */
    const JSFileRegex = /^.*\.js(?:\?.*)?/g;
    if (!JSFileRegex.test(url)) {
      logger.silly(`EMPTY: ${readableURLForLogging}`);

      /**
       * Though we intentionally don't want to load this file, we can't
       * just return null per the spec as this can break promise
       * resolutions that are relying on this file. Instead, we resolve
       * as an empty string so things can tidy up properly.
       */
      return JSDOMResourceLoader.EMPTY_RESPONSE;
    }

    /**
     * This must be a JavaScript file request. Let's make a request for the
     * file and then handle it coming back.
     */
    const abortableFetch = (0, _request.request)(logger, url, {
      ...this._requestOptions,
      agent: this._getAgent(url)
    });
    const handleInactive = abortableFetch.then(response => {
      const {
        aborted
      } = abortableFetch;
      if (!this._active || aborted) {
        if (!aborted) {
          logger.info(`File requested but never used: ${readableURLForLogging}`);
        }

        /**
         * Just return an empty buffer so no code executes. The
         * request function passed at construction will have handled
         * caching of the real file request.
         */
        return Buffer.from("");
      }

      /**
       * Our requests are always buffered.
       *
       * This is OK because we limit our requests to only text files.
       * If this code were downloading binary data, this would not be
       * helpful and we may want to consider using the default buffer
       * setup that only buffers for things where a parser is available.
       *
       * Let's worry about that later.
       */
      return Buffer.from(response.text);
    });

    /**
     * If we have a custom handler, we now let that do work.
     */
    const finalResult = this._handleFetchResult == null ? handleInactive : this._handleFetchResult(handleInactive, url, options);

    /**
     * We have to turn this back into an abortable promise so that JSDOM
     * can abort it when closing, if it needs to.
     */
    finalResult.abort = abortableFetch.abort;
    Object.defineProperty(finalResult, "aborted", {
      get: () => abortableFetch.aborted
    });
    return finalResult;
  }
}
exports.JSDOMResourceLoader = JSDOMResourceLoader;
//# sourceMappingURL=jsdom-resource-loader.js.map