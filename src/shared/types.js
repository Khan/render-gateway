// @flow
import type {
    NpmLogLevels,
    Logger as WinstonLogger,
    Info as WinstonInfo,
} from "winston";

import type {$Request} from "express";

/**
 * Describes logging metdata.
 */
export type Info = WinstonInfo<NpmLogLevels>;

/**
 * Defines the different log levels.
 */
export type LogLevel = $Keys<NpmLogLevels>;

/**
 * Describes the interface for logging gateway activity.
 */
export type Logger = WinstonLogger<NpmLogLevels>;

/**
 * Information about a gateway.
 */
export type GatewayInfo = {
    /**
     * Usually the value of GAE_SERVICE, if set. Otherwise, "unknown".
     */
    +name: string,

    /**
     * Usually the value of GAE_VERSION, if set. Otherwise, "unknown".
     */
    +version: string,
};

/**
 * Represents an error when we don't really know how it is structured.
 *
 * Use extractErrorString to turn this into a string.
 */
export type AmbiguousError =
    | string
    | {
          error?: AmbiguousError,
          response?: {
              error?: string,
          },
          stack?: string,
          ...
      };

/**
 * Information to attach to a trace session.
 */
export type TraceSessionInfo = {
    /**
     * The level at which to log the session.
     */
    +level?: LogLevel,

    /**
     * Additional metadata about the session.
     */
    +[datum: string]: mixed,
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

/**
 * The runtime modes that a gateway can run under.
 */
export type Runtime = "production" | "test" | "development";

/**
 * Options to configure a gateway.
 */
export type GatewayOptions = {
    /**
     * The name of the gateway.
     *
     * If GAE_SERVICE is not set when the gateway is started, it will be set
     * to this value.
     */
    +name: string,

    /**
     * The port on which the gateway should listen.
     */
    +port: number,

    /**
     * The logger to use for logging.
     */
    +logger: Logger,

    /**
     * What runtime mode the gateway is running under.
     */
    +mode: Runtime,
};

export type RequestWithLog<TReq: $Request> = TReq & {
    log?: Logger,
};
