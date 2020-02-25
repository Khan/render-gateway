"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGCloudSecrets = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _util = require("util");

var _kms = _interopRequireDefault(require("@google-cloud/kms"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Utilities for reading secrets from secrets files.
 */
const readFile = (0, _util.promisify)(_fs.default.readFile);
/**
 * Look up secrets during development.
 *
 * This assumes a secrets-config.json file exists and then uses the given
 * lookupFn to map them to dev secrets.
 */

const secretsForDev = async (serviceRootPath, lookupFn) => {
  // NOTE(somewhatabstract): It's convenient to use require here since that
  // already understands JSON, but that's harder to test. This way we get
  // the same functionality but we can actually test it.
  const configBuffer = await readFile(_path.default.join(serviceRootPath, "secrets-config.json"));
  const secretsConfig = JSON.parse(configBuffer);
  const secrets = {};
  Object.keys(secretsConfig).forEach(name => {
    const secret = lookupFn(name, secretsConfig[name]);

    if (!secret) {
      throw new Error(`Could not read secret ${name}`);
    }

    secrets[name] = secret;
  });
  return secrets;
};
/**
 * Look up secrets during production.
 *
 * This is based on
 * https://cloud.google.com/kms/docs/encrypt-decrypt#kms-howto-encrypt-nodejs
 */


const secretsForProd = async cryptoKeyPath => {
  const client = new _kms.default.KeyManagementServiceClient();
  const contentsBuffer = await readFile("./secrets.json.enc");
  const ciphertext = contentsBuffer.toString("base64");
  const [result] = await client.decrypt({
    name: cryptoKeyPath,
    ciphertext
  });
  return JSON.parse(Buffer.from(result.plaintext, "base64"));
};
/**
 * Get secrets
 */


const getGCloudSecrets = config => {
  if (config.cryptoKeyPath) {
    return secretsForProd(config.cryptoKeyPath);
  } else if (config.serviceRootPath) {
    return secretsForDev(config.serviceRootPath, config.lookupFn);
  }

  throw new Error("Unsupported configuration");
};

exports.getGCloudSecrets = getGCloudSecrets;
//# sourceMappingURL=get-gcloud-secrets.js.map