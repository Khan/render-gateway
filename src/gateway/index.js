// @flow
/**
 * Trace agent is a special case where it must be imported first to ensure
 * correct instrumentation of other imported modules.
 */
// eslint-disable-next-line import/no-unassigned-import
import "../ka-shared/start-trace-agent.js";

export type {RenderGatewayOptions} from "./types.js";

export {runServer} from "./run-server.js";
