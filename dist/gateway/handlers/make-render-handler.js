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
async function renderHandler(renderFn, req, res) {
  const logger = (0, _index2.getLogger)(req);
  /**
   * TODO(somewhatabstract, WEB-1108): Actually track headers and build vary
   * header.
   * Encapsulate in other code to make it easily tested.
   */

  const trackHeaderLookup = name => {
    return req.header(name);
  };
  /**
   * TODO(somewhatabstract, WEB-2057): Hook in tracing (make sure that we
   * don't leave trace sessions open on rejection (or otherwise)).
   *
   * For now, we'll assume callers will tidy up.
   */


  const traceFn = name => (0, _index2.trace)(name, req);
  /**
   * The URL being rendered is given in a query param named, url.
   */


  const renderURL = req.query["url"];

  if (typeof renderURL !== "string") {
    if (renderURL == null) {
      throw new Error(`Missing url query param`);
    }

    throw new Error(`More than one url query param given`);
  }

  try {
    /**
     * Put together the API we make available when rendering.
     */
    const renderAPI = {
      getHeader: trackHeaderLookup,
      trace: traceFn
    };
    /**
     * Defer this bit to the render callback.
     */

    const {
      body,
      status
    } = await renderFn(renderURL, renderAPI);
    /**
     * TODO(somewhatabstract, WEB-1108): Validate the status with the
     * headers.
     * There are a couple where we know we need certain things to match
     * 1. If a Vary header is included, we should error to indicate that
     *    is not allowed
     * 2. For 301/302 status, we need a `Location` header.
     *
     * validateStatusAndHeaders(status, headers);
     */
    // TODO(somewhatabstract, WEB-1108): Add headers.
    // TODO(somewhatabstract, WEB-1108): Add Vary header.

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
  }
}
/**
 * Create a render handler.
 *
 * This creates a handler for use with express. The created handler manages
 * executing the render process, a part of which involves invoking the given
 * render function.
 *
 * @param {RenderCallback} renderFn The function that is responsible for
 * performing the render operation.
 */


const makeRenderHandler = renderFn => (req, res) => renderHandler(renderFn, req, res);

exports.makeRenderHandler = makeRenderHandler;
//# sourceMappingURL=make-render-handler.js.map