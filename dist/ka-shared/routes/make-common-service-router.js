"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeCommonServiceRouter = void 0;

var _express = require("express");

/**
 * Make the router to handle the /_api routes.
 *
 * Takes the version string to be returned via the /_api/version route.
 */
const makeCommonServiceRouter = version => new _express.Router().get("/_api/ping", (req, res) => {
  res.send("pong\n");
}).get("/_api/version", (req, res) => {
  res.send({
    version
  });
});

exports.makeCommonServiceRouter = makeCommonServiceRouter;
//# sourceMappingURL=make-common-service-router.js.map