"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRuntimeMode = void 0;

/**
 * Determine the node runtime mode.
 *
 * The mode is calculated from NODE_ENV. If NODE_ENV is not set or set to
 * something other than expected values, the defaultMode is returned.
 *
 * @returns {Runtime} The runtime mode of production, development, or test.
 */
const getRuntimeMode = defaultMode => {
  switch (process.env.NODE_ENV) {
    case "test":
      return "test";

    case "production":
    case "prod":
      return "production";

    case "development":
    case "dev":
      return "development";

    default:
      return defaultMode;
  }
};

exports.getRuntimeMode = getRuntimeMode;
//# sourceMappingURL=get-runtime-mode.js.map