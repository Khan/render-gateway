// @flow
// Start logging agent for Cloud Trace (https://cloud.google.com/trace/).
import * as traceAgent from "@google-cloud/trace-agent";
import type {Tracer} from "@google-cloud/trace-agent";
import type {Runtime} from "./shared/index.js";

export const startTraceAgent = (mode: Runtime): Tracer =>
    traceAgent.start({enabled: mode === "production"});
