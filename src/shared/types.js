// @flow
import type {
    NpmLogLevels,
    Logger as WinstonLogger,
    Info as WinstonInfo,
} from "winston";

import type {$Request} from "express";

export type Info = WinstonInfo<NpmLogLevels>;

export type LogLevel = $Keys<NpmLogLevels>;

export type Logger = WinstonLogger<NpmLogLevels>;

/**
 * Information to attach to a trace session.
 */
export type TraceSessionInfo = {
    level?: LogLevel,
    [datum: string]: mixed,
    ...
};

/**
 * A trace session that has been started.
 */
export interface ITraceSession {
    /**
     * The name of the session as provided when it was started.
     */
    get name(): string;

    /**
     * End the trace session.
     *
     * It the session were opened with a Google Cloud tracer, this will also
     * end the associated tracer span.
     *
     * @param {TraceSessionInfo} [info] Additional information to
     * modify the logged session info. This can be used to provide a different
     * level at which to log the session (default is "debug"). All other
     * fields are used to add metadata to the logged session.
     * @returns {void}
     */
    end(info?: TraceSessionInfo): void;
}

export type Runtime = "production" | "test" | "development";

export type GatewayOptions = {
    name: string,
    port: number,
    logger: Logger,
    mode: Runtime,
};

export type RequestWithLog<TReq: $Request> = TReq & {
    log?: Logger,
};
