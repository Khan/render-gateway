// @flow
import type {Tracer} from "@google-cloud/trace-agent";
import type {Logger, ITraceSession, TraceSessionInfo} from "./types.js";

/**
 * Start tracing an event.
 *
 * This will log the start of a trace and open a trace session, which is
 * returned. Use the returned session to end the trace when the traced event is
 * over. The traced event will be logged and also written to the Google Cloud
 * StackDriver Trace agent.
 *
 * @param {Logger} logger A logger to use for documention and timing the
 * traced action.
 * @param {string} name The name of the traced action.
 * @param {Tracer} [tracer] A Google Cloud trace agent tracer which
 * can be used to record the traced action.
 * @returns {ITraceSession} A trace session that the caller should use to
 * indicate when the session is finished.
 */
export const trace = (
    logger: Logger,
    name: string,
    tracer?: Tracer,
): ITraceSession => {
    if (!name) {
        throw new Error("Must provide a name for the trace session.");
    }

    /**
     * We are going to use the logger's profiling API (provided by winston).
     * However, we want to mark the start of the trace as it gives us some
     * debug information which can be valuable when investigating operations.
     *
     * Winston only logs when profiling is done and the optional trace agent
     * tracer will only show the span if it is ended.
     *
     * Since this is noise in most situations, we will log this at the lowest
     * level of silly.
     */
    logger.silly(`TRACE: ${name}`);

    /**
     * Now we start the profiling timer.
     */
    const profiler = logger.startTimer();

    /**
     * Next, if we were given a tracer, we start a trace section for this so
     * trace session so that it will appear in Stackdriver Trace.
     *
     * We annotate the span with "TRACE:" so that it is clear in the trace
     * which spans were created by this API and which were inserted by other
     * means.
     */
    const span = tracer?.createChildSpan({name: `TRACE: ${name}`});

    /**
     * This is the function that we will return to our caller.
     * It can then be used to end and record the trace session.
     */
    const end = (info?: TraceSessionInfo): void => {
        /**
         * Let's mark our profile as done.
         *
         * We include the session info object, but make sure to set the level
         * and message ourselves.
         */
        profiler.done({
            ...info,
            message: `TRACED: ${name}`,
            level: info?.level || "debug",
        });

        /**
         * If we started a tracer span, let's end it.
         *
         * We disable this lint rule as the linter does not appear to
         * understand the optional chaining.
         */
        // eslint-disable-next-line flowtype/no-unused-expressions
        span?.endSpan();
    };

    return {
        get name() {
            return name;
        },
        end,
    };
};
