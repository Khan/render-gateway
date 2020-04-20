"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeRenderHandler = void 0;

var _index = require("../../shared/index.js");

var _index2 = require("../../ka-shared/index.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Handle a request as a render.
 *
 * This method orchestrates the download and setup of a render environment
 * and the subsequent rendering process. The downloaded code is responsible for
 * the actual render operation.
 *
 * This is expected to be wrapped with express-async-handler.
 */
async function renderHandler(renderEnvironment, req, res) {
  const logger = (0, _index2.getLogger)(req);
  /**
   * We track header access and provide an API to find out which headers were
   * accessed. This allows service implementations and their rendering code
   * to properly generate a Vary header or work out what data a page should
   * embed so that they can implement effective caching and hydration
   * strategies.
   */

  const trackedHeaders = {};

  const trackHeaderLookup = name => {
    const headerValue = req.header(name);

    if (headerValue != null) {
      trackedHeaders[name] = headerValue;
    }

    return headerValue;
  };

  const getTrackedHeaders = () => Object.assign({}, trackedHeaders);
  /**
   * TODO(somewhatabstract, WEB-2057): Make sure that we don't leave trace
   * sessions open on rejection (or otherwise).
   *
   * For now, we'll assume callers will tidy up.
   */


  const traceFn = (action, message) => (0, _index2.trace)(action, message, req);
  /**
   * The URL being rendered is given in a query param named, url.
   */


  const renderURL = req.query.url;

  if (typeof renderURL !== "string") {
    if (renderURL == null) {
      throw new Error(`Missing url query param`);
    }

    throw new Error(`More than one url query param given`);
  }

  const traceSession = traceFn("render", `Rendering ${renderURL}`);

  try {
    /**
     * Put together the API we make available when rendering.
     */
    const renderAPI = {
      getHeader: trackHeaderLookup,
      trace: traceFn,
      getTrackedHeaders,
      logger
    };
    /**
     * Defer this bit to the render callback.
     */

    const {
      body,
      status,
      headers
    } = await renderEnvironment.render(renderURL, renderAPI);
    traceSession.addLabel("/result/status", status);
    traceSession.addLabel("/result/headers", headers);
    /**
     * We don't do anything to the response headers other than validate
     * that redirect-type statuses include a Location header.
     * 3xx headers that MUST have a Location header are:
     * - 301
     * - 302
     * - 307
     * - 308
     */

    if ([301, 302, 307, 308].includes(status) && headers["Location"] == null) {
      throw new Error("Render resulted in redirection status without required Location header");
    }
    /**
     * TODO(somewhatabstract): Since we have access to the tracked
     * headers, we could generate a Vary header for the response when one
     * is not already included. This would ensure it does the right thing
     * out-of-the-box while also providing means to support more complex
     * implementations. This is super low priority though.
     */

    /**
     * Finally, we set the headers, status and send the response body.
     */


    res.header(headers);
    res.status(status);
    res.send(body);
  } catch (e) {
    /**
     * Something went wrong. Let's report it!
     */
    const error = (0, _index.extractError)(e);
    logger.error("Render failed", _objectSpread({}, error, {
      renderURL
    }));
    res.status(500).json(error);
  } finally {
    traceSession.end();
  }
}
/**
 * Create a render handler.
 *
 * This creates a handler for use with express. The created handler manages
 * executing the render process, a part of which involves invoking a render
 * within the given render environment.
 *
 * @param {IRenderEnvironment} renderEnvironment The environment responsible for
 * performing renders.
 */


const makeRenderHandler = renderEnvironment => (req, res) => renderHandler(renderEnvironment, req, res);

exports.makeRenderHandler = makeRenderHandler;
//# sourceMappingURL=make-render-handler.js.map