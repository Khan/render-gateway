// @flow
/**
 * These are other files that this "package" makes available for direct
 * import besides this index.js. This list is used to ensure we export flow
 * types for these if they get directly imported.
 *
 * @additional-exports [
 *      "./get-runtime-mode.js",
 * ]
 */
export type {
    Runtime,
    LogLevel,
    Logger,
    GatewayOptions,
    RequestWithLog,
    AmbiguousError,
    TraceSessionInfo,
    ITraceSession,
    SimplifiedError,
} from "./types.js";

export {createLogger} from "./create-logger.js";
export {getLogger} from "./get-logger.js";
export {getGatewayInfo} from "./get-gateway-info.js";
export {getRequestLogger} from "./get-request-logger.js";
export {getRuntimeMode} from "./get-runtime-mode.js";
export {startGateway} from "./start-gateway.js";
export {trace} from "./trace.js";
export {extractError} from "./extract-error.js";
export {getAgentForURL} from "./get-agent-for-url.js";
