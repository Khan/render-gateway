"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSecrets = void 0;

var _index = require("../ka-shared/index.js");

/**
 * Get the secrets table for the service.
 */
const getSecrets = cryptoKeyPath => {
  switch ((0, _index.getRuntimeMode)()) {
    case "production":
      return (0, _index.getGCloudSecrets)({
        cryptoKeyPath
      });

    default:
      /**
       * This should never get called, but I wanted to demonstrate
       * call usage. We give a false path and return null from the
       * lookupFn. This means it won't find a secrets config file, and it
       * it does, it'll still throw from looking up null values.
       *
       * A service that needs this behavior would provide a real root path
       * and a real lookup function.
       */
      return (0, _index.getGCloudSecrets)({
        serviceRootPath: "",
        lookupFn: () => null
      });
  }
};

exports.getSecrets = getSecrets;
//# sourceMappingURL=get-secrets.js.map