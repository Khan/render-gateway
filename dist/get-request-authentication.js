"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRequestAuthentication = void 0;
var _wonderStuffCore = require("@khanacademy/wonder-stuff-core");
var _wonderStuffServer = require("@khanacademy/wonder-stuff-server");
var _getSecrets = require("./get-secrets.js");
/**
 * Get the request authentication options for the service.
 *
 * Given the authentication options, this will load the secrets file, decrypt
 * it, and return the values needed for request authentication in a format
 * compatible with wonder-stuff-server.
 *
 * @param {AuthenticationOptions} authentication The authentication options
 * for the service.
 * @returns {Promise<?ServerOptions["requestAuthentication"]>} The promise of
 * the request authentication values.
 */
const getRequestAuthentication = async authentication => {
  if (authentication == null) {
    return Promise.resolve();
  }
  const {
    cryptoKeyPath,
    headerName,
    secretKey,
    deprecatedSecretKey
  } = authentication;
  const secrets = await (0, _getSecrets.getSecrets)(cryptoKeyPath);
  const secret = secrets[secretKey];
  const deprecatedSecret = deprecatedSecretKey == null ? secret : secrets[deprecatedSecretKey] ?? secret;
  if (secret == null) {
    /**
     * We don't check if the deprecated secret is set or not. If it isn't
     * that's not a critical error.
     */
    throw new _wonderStuffCore.KindError("Unable to load secret", _wonderStuffServer.Errors.NotFound);
  }
  return {
    headerName,
    secret,
    deprecatedSecret
  };
};
exports.getRequestAuthentication = getRequestAuthentication;
//# sourceMappingURL=get-request-authentication.js.map