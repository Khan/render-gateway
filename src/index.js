// @flow
/**
 * Trace agent is a special case where it must be imported first to ensure
 * correct instrumentation of other imported modules.
 */
// eslint-disable-next-line import/no-unassigned-import
import "./ka-shared/start-trace-agent.js";

import * as KA from "./ka-shared/index.js";
import {getRuntimeMode} from "./ka-shared/get-runtime-mode.js";

export type {GatewayOptions} from "./shared/index.js";

export {runServer} from "./run-server.js";

export const KAShared = {
    ...KA,
    getRuntimeMode,
};
