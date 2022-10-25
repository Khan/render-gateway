"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGatewayInfo = void 0;

/**
 * Get info about the running gateway.
 *
 * Encapsulates the retrieval of gateway information to abstract away things
 * like GAE env vars.
 *
 * @returns {GatewayInfo} The information about the gateway.
 */
const getGatewayInfo = () => ({
  name: process.env.GAE_SERVICE || "unknown",
  version: process.env.GAE_VERSION || "unknown",
  instance: process.env.GAE_INSTANCE || "unknown",
  pid: process.pid
});
exports.getGatewayInfo = getGatewayInfo;
//# sourceMappingURL=get-gateway-info.js.map