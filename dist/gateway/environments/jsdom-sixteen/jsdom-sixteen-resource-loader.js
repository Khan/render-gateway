"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSDOMSixteenResourceLoader = void 0;

var _url = require("url");

var _jsdom = require("jsdom");

var _index = require("../../../shared/index.js");

var _request = require("../../request.js");

var _applyAbortablePromisesPatch = require("./apply-abortable-promises-patch.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * A ResourceLoader implementation for JSDOM sixteen-compatible versions of
 * JSDOM that only allows for fetching JS files.
 *
 * A JS file request is identified by the regular expression:
 *   /^.*\.js(?:\?.*)?/g
 */
class JSDOMSixteenResourceLoader extends _jsdom.ResourceLoader {
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
   * @param {RequestFn} requestFn
   * The function responsibly for fulfilling GET requests for URLs.
   */


  constructor(renderAPI, requestOptions = _request.DefaultRequestOptions) {
    // Patch before super to make sure promises get an abort.
    (0, _applyAbortablePromisesPatch.applyAbortablePromisesPatch)();
    super();

    _defineProperty(this, "_active", void 0);

    _defineProperty(this, "_renderAPI", void 0);

    _defineProperty(this, "_requestOptions", void 0);

    _defineProperty(this, "_agents", void 0);

    if (renderAPI == null) {
      throw new Error("Must provide render API.");
    }

    this._active = true;
    this._renderAPI = renderAPI;
    this._requestOptions = requestOptions;
    this._agents = {};
  }

  _getAgent(url) {
    const parsedURL = new _url.URL(url);
    const agent = this._agents[parsedURL.protocol] || (0, _index.getAgentForURL)(parsedURL);
    this._agents[parsedURL.protocol] = agent;
    return agent;
  }

  get isActive() {
    return this._active;
  }

  close() {
    this._active = false;
    (0, _request.abortInFlightRequests)();
    /**
     * We need to destroy any agents we created or they may retain
     * sockets that retain references to our JSDOM environment and cause
     * a memory leak.
     */

    for (const agent of Object.values(this._agents)) {
      // $FlowIgnore We know that it's there.
      agent.destroy();
    }

    this._agents = {};
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


      return JSDOMSixteenResourceLoader.EMPTY_RESPONSE;
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

      return JSDOMSixteenResourceLoader.EMPTY_RESPONSE;
    }
    /**
     * This must be a JavaScript file request. Let's make a request for the
     * file and then handle it coming back.
     */


    const abortableFetch = (0, _request.request)(logger, url, _objectSpread(_objectSpread({}, this._requestOptions), {}, {
      agent: this._getAgent(url)
    }));
    const handleInactive = abortableFetch.then(response => {
      if (!this._active) {
        logger.silly(`File requested but never used: ${readableURLForLogging}`);
        /**
         * Just return an empty buffer so no code executes. The
         * request function passed at construction will have handled
         * caching of the real file request.
         */

        return Buffer.from("");
      }

      return Buffer.from(response.text);
    });
    /**
     * We have to turn this back into an abortable promise so that JSDOM
     * can abort it when closing, if it needs to.
     */

    handleInactive.abort = abortableFetch.abort;
    return handleInactive;
  }

}

exports.JSDOMSixteenResourceLoader = JSDOMSixteenResourceLoader;
//# sourceMappingURL=jsdom-sixteen-resource-loader.js.map