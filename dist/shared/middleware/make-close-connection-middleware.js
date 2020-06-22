"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeCloseConnectionMiddleware = void 0;

/**
 * We want to ensure that the client doesn't use Keep Alive to keep the HTTP
 * connection open to the server, so we send back a Connection: close header
 * to get it to close right away.
 */
const makeCloseConnectionMiddleware = () => {
  const middleware = async (req, res, next) => {
    // Tell the client to not keep the connection alive, this will
    // ensure that we're able to shutdown the server as soon as the
    // request has finished.
    res.set("Connection", "close");
    next();
  };

  return middleware;
};

exports.makeCloseConnectionMiddleware = makeCloseConnectionMiddleware;
//# sourceMappingURL=make-close-connection-middleware.js.map