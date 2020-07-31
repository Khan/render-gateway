// @flow

import type {
    NpmLogLevels,
    Logger as WinstonLogger,
    Info as WinstonInfo,
} from "winston";

import type {$Request} from "express";
import typeof {Errors} from "./errors.js";

/**
 * What kind of error is being reported.
 *
 * This type represents our error taxonomy:
 *  - https://khanacademy.atlassian.net/wiki/spaces/ENG/pages/150208513/Goliath+Errors+Best+Practices
 */
export type ErrorKind = $Values<Errors>;

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

    /**
     * Usually the value of GAE_INSTANCE, if set. Otherwise, "unknown".
     */
    +instance: string,

    /**
     * The process identifier.
     */
    +pid: number,
};

/**
 * Represents an error and associated stack.
 */
export type SimplifiedError = {
    /**
     * A string representing the error that occurred.
     * In some circumstances, this will match the stack property.
     */
    +error: ?string,

    /**
     * The error's stack, if it has one.
     */
    +stack?: string,
};

/**
 * Represents an error when we don't really know how it is structured.
 *
 * Use extractError to turn this into a SimplifiedError representation.
 */
export type AmbiguousError =
    | SimplifiedError
    | string
    | {
          error?: AmbiguousError,
          response?: {
              error?: string,
          },
          stack?: string,
          ...
      }
    | Error;

/**
 * Information to attach to a trace session.
 */
export type TraceSessionInfo = {
    /**
     * The level at which to log the session.
     */
    +level?: LogLevel,

    /**
     * Additional metadata about the session. Unlike using `addLabel` on the
     * trace session, this will only go to logging and not the trace as well.
     */
    +[datum: string]: mixed,
    ...
};

/**
 * A trace session that has been started.
 */
export interface ITraceSession {
    /**
     * The name of the action being traced as provided when it was started.
     */
    get action(): string;

    /**
     * Add a label to the trace session.
     *
     * Adds a key-value pair as a label to the trace span and metadata to the
     * logged output. Both the name and value may be truncated in the trace
     * according to hosting configuration. The value will be coerced to a
     * string in tracing if it isn't one already.
     */
    addLabel<T>(name: string, value: T): void;

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
     * The hostname to which the gateway should bind.
     */
    +host: string,

    /**
     * The logger to use for logging.
     */
    +logger: Logger,

    /**
     * What runtime mode the gateway is running under.
     */
    +mode: Runtime,

    /**
     * Optional value in milliseconds for keepalive timeout of the server.
     * For running in Google Cloud, this should be higher than the load
     * balancer's own keepalive timeout value, which at time of writing was
     * indicated to be 80000ms [1].
     *
     * [1] https://khanacademy.slack.com/archives/CJSE4TMQX/p1573252787333500
     *
     * Defaults to 90000.
     */
    +keepAliveTimeout?: number,
};

export type RequestWithLog<TReq: $Request> = TReq & {
    log?: Logger,
};
