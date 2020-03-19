"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeCheckSecretMiddleware = makeCheckSecretMiddleware;

var _index = require("../../ka-shared/index.js");

var _getSecrets = require("../get-secrets.js");

async function makeProductionMiddleware(options) {
  /**
   * We look up the secret when the middleware is created. That means
   * that if the secret changes, the server needs to be
   * restarted/refreshed somehow.
   *
   * TODO(somewhatabstract, WEB-1410): Add ability to trigger refresh of
   * server - likely just a killswitch to kill an instance so that GAE spins
   * up new ones.
   */
  const {
    secretKey,
    headerName,
    cryptoKeyPath
  } = options;
  const secrets = await (0, _getSecrets.getSecrets)(cryptoKeyPath);
  const secret = secrets[secretKey];

  if (secret == null) {
    throw new Error("Unable to load secret");
  }

  return function (req, res, next) {
    const requestSecret = req.header(headerName);

    if (requestSecret !== secret) {
      res.status(401).send({
        error: "Missing or invalid secret"
      });
      return;
    }

    next();
  };
}

function makeDevelopmentMiddleware() {
  /**
   * The secrets middleware is a noop when not in production.
   */
  return Promise.resolve(function (req, res, next) {
    next();
  });
}
/**
 * Make the middleware to verify a request's authentication secret.
 *
 * This is a noop when not in production, otherwise this loads the appropriate
 * secret as identified by the options and then uses the configured header name
 * to identify the request header that it is to be matched against.
 */


function makeCheckSecretMiddleware(authenticationOptions) {
  if (authenticationOptions != null && (0, _index.getRuntimeMode)() === "production") {
    return makeProductionMiddleware(authenticationOptions);
  }

  return makeDevelopmentMiddleware();
}
//# sourceMappingURL=make-check-secret-middleware.js.map