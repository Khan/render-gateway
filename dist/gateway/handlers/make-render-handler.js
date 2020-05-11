"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeRenderHandler = void 0;

var _index = require("../../ka-shared/index.js");

var _handleError = require("./handle-error.js");

/**
 * Handle a request as a render.
 *
 * This method orchestrates the download and setup of a render environment
 * and the subsequent rendering process. The downloaded code is responsible for
 * the actual render operation.
 *
 * This is expected to be wrapped with express-async-handler.
 */
async function renderHandler(renderEnvironment, errorHandler, defaultErrorResponse, req, res) {
  const logger = (0, _index.getLogger)(req);
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


  const traceFn = (action, message) => (0, _index.trace)(action, message, req);
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
    (0, _handleError.handleError)("Render failed", errorHandler, defaultErrorResponse, req, res, e);
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


const makeRenderHandler = (renderEnvironment, errorHandler, defaultErrorResponse) => (req, res) => renderHandler(renderEnvironment, errorHandler, defaultErrorResponse, req, res);

exports.makeRenderHandler = makeRenderHandler;
//# sourceMappingURL=make-render-handler.js.map