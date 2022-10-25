"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeCommonServiceRouter = void 0;
var _express = require("express");
var _expressAsyncHandler = _interopRequireDefault(require("express-async-handler"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Make the router to handle the /_api routes.
 *
 * Takes the version string to be returned via the /_api/version route.
 */
const makeCommonServiceRouter = (version, warmUpHandler) => new _express.Router().get("/_api/ping", (req, res) => {
  res.send("pong\n");
}).get("/_api/version", (req, res) => {
  res.send({
    version
  });
}).get("/_ah/warmup", (0, _expressAsyncHandler.default)(async (req, res, next) => {
  await (warmUpHandler === null || warmUpHandler === void 0 ? void 0 : warmUpHandler(req.headers));
  res.send("OK\n");
}));
exports.makeCommonServiceRouter = makeCommonServiceRouter;
//# sourceMappingURL=make-common-service-router.js.map