"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderHandler = renderHandler;

var _index = require("../ka-shared/index.js");

/**
 * Handle a request as a render.
 *
 * This method orchestrates the download and setup of a render environment
 * and the subsequent rendering process. The downloaded code is responsible for
 * the actual render operation.
 *
 * This is expected to be wrapped with express-async-handler.
 */
async function renderHandler(req, res) {
  // TODO(somewhatabstract): Use profiling API to trace this.
  (0, _index.getLogger)(req).debug(`RENDER: ${req.url}`); // OK, so it's not async yet. But it will be, eventually.

  res.send(`The URL you requested was ${req.url}`);
}
//# sourceMappingURL=render-handler.js.map