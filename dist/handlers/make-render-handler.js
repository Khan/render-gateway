"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeRenderHandler = void 0;
var _wonderStuffCore = require("@khanacademy/wonder-stuff-core");
var _wonderStuffServer = require("@khanacademy/wonder-stuff-server");
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
  const logger = (0, _wonderStuffServer.getLogger)(req);

  /**
   * TODO(somewhatabstract, WEB-2057): Make sure that we don't leave trace
   * sessions open on rejection (or otherwise).
   *
   * For now, we'll assume callers will tidy up.
   */
  const traceFn = (action, message) => (0, _wonderStuffServer.trace)(action, message, req);

  /**
   * The URL being rendered is given in a query param named, url.
   */
  const renderURL = req.query.url;
  if (typeof renderURL !== "string") {
    if (renderURL == null) {
      throw new _wonderStuffCore.KindError(`Missing url query param`, _wonderStuffCore.Errors.InvalidInput);
    }
    throw new _wonderStuffCore.KindError(`More than one url query param given`, _wonderStuffCore.Errors.InvalidInput);
  }
  const traceSession = traceFn("render", `Rendering ${renderURL}`);
  try {
    /**
     * Put together the API we make available when rendering.
     */
    const renderAPI = {
      trace: traceFn,
      logger,
      // Passthrough the request headers
      headers: {
        ...req.headers
      }
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
      throw new _wonderStuffCore.KindError("Render resulted in redirection status without required Location header", _wonderStuffCore.Errors.NotAllowed);
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
    await (0, _handleError.handleError)("Render failed", errorHandler, defaultErrorResponse, req, res, e);
  } finally {
    traceSession.end({
      level: "info"
    });
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
const makeRenderHandler = (renderEnvironment, errorHandler, defaultErrorResponse) => (req, res, next) => renderHandler(renderEnvironment, errorHandler, defaultErrorResponse, req, res).finally(next);
exports.makeRenderHandler = makeRenderHandler;
//# sourceMappingURL=make-render-handler.js.map