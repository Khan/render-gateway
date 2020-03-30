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
    GetHeaderCallback,
    RenderAPI,
    RenderResult,
} from "./types.js";

export {runServer} from "./run-server.js";
export const Requests = RequestAPI;
export {Environments} from "./environments/index.js";
