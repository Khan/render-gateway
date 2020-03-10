// @flow
import * as traceAgent from "@google-cloud/trace-agent";
import type {$Request} from "express";
import {trace as traceImpl} from "../shared/index.js";
import {getLogger} from "./get-logger.js";

import type {RequestWithLog, ITraceSession} from "../shared/types.js";

/**
 * Start tracing an event.
 *
 * This will log the start of a trace and open a trace session, which is
 * returned. Use the returned session to end the trace when the traced event is
 * over. The traced event will be logged and also written to the Google Cloud
 * StackDriver Trace agent.
 *
 * Note that if startTraceAgent was never called, this will still log but the
 * StackDriver trace span creation will not actually happen.
 *
 * @param {string} name The name of the event being traced.
 * @param {TReq: RequestWithLog<$Request>} [request] The request being
 * fulfilled. This is used to determine if a request-scoped logger can be used.
 * @returns {ITraceSession} The new trace session that was created and is to be
 * used to end the session.
 */
export const trace = <TReq: RequestWithLog<$Request>>(
    name: string,
    request?: TReq,
): ITraceSession => {
    const logger = getLogger(request);
    const tracer = traceAgent.get();
    return traceImpl(logger, name, tracer);
};
