// @flow
/**
 * Trace agent is a special case where it must be imported first to ensure
 * correct instrumentation of other imported modules.
 */
// eslint-disable-next-line import/no-unassigned-import
import "./start-trace-agent.js";

export * as Requests from "./request.js";

export type {
    RenderGatewayOptions,
    RequestOptions,
    AbortablePromise,
    IRenderEnvironment,
    TraceCallback,
    RenderAPI,
    RenderResult,
    ErrorResult,
    CustomErrorHandlerFn,
    Response,
    Request,
    Timeouts,
    ICloseable,
    SimplifiedError,
    AmbiguousError,
} from "./types.js";
export type * from "./environments/index.js";

export {extractError} from "./extract-error.js";
export {runServer} from "./run-server.js";
export {Environments} from "./environments/index.js";
