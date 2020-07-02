// @flow
import type {GatewayInfo} from "./types.js";

/**
 * Get info about the running gateway.
 *
 * Encapsulates the retrieval of gateway information to abstract away things
 * like GAE env vars.
 *
 * @returns {GatewayInfo} The information about the gateway.
 */
export const getGatewayInfo = (): GatewayInfo => ({
    name: process.env.GAE_SERVICE || "unknown",
    version: process.env.GAE_VERSION || "unknown",
    instance: process.env.GAE_INSTANCE || "unknown",
    pid: process.pid,
});
