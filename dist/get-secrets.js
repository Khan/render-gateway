"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSecrets = void 0;
var _wonderStuffServer = require("@khanacademy/wonder-stuff-server");
var _readFile = require("./read-file.js");
/**
 * Get the secrets table for the service.
 */
const getSecrets = async cryptoKeyPath => {
  const encryptedSecretsBuffer = await (0, _readFile.readFile)("./secrets.json.enc");
  const decrypedSecretsBuffer = await (0, _wonderStuffServer.decryptBufferWithKms)(cryptoKeyPath, encryptedSecretsBuffer);
  return JSON.parse(decrypedSecretsBuffer.toString());
};
exports.getSecrets = getSecrets;
//# sourceMappingURL=get-secrets.js.map