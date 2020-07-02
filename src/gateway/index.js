// @flow
/**
 * Trace agent is a special case where it must be imported first to ensure
 * correct instrumentation of other imported modules.
 */
// eslint-disable-next-line import/no-unassigned-import
import "../ka-shared/start-trace-agent.js";

import * as RequestAPI from "./request.js";

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
} from "./types.js";
export type * from "./environments/index.js";

export {runServer} from "./run-server.js";
export const Requests = RequestAPI;
export {Environments} from "./environments/index.js";
