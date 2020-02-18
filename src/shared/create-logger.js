// @flow
import stream from "stream";
import winston from "winston";

import * as lw from "@google-cloud/logging-winston";

import type {Transport, NpmLogLevels, Format} from "winston";
import type {Runtime, Logger, LogLevel, Info} from "./types.js";

/**
 * This is how the log message gets formatted.
 *
 * We can expand this to include additional metadata as needed. For example,
 * if we have the profiling API from react-render-server, we could include
 * the duration metadata.
 */
const devFormatter = ({level, message}: Info): string => `${level}: ${message}`;

/**
 * Build the formatters to give us some nice dev output.
 */
const getFormatters = (mode: Runtime): Format => {
    const formatters: Array<Format> = [
        winston.format.splat(), // Allows for %s style substitutions
        winston.format.printf((info: any) => devFormatter(info)),
    ];
    if (mode === "development") {
        formatters.push(winston.format.cli({level: true}));
    }
    return winston.format.combine(...formatters);
};

/**
 * Gets the logging transport for the given mode.
 */
const getTransport = (mode: Runtime): Transport => {
    switch (mode) {
        default:
        case "test":
            /**
             * During testing, we just dump logging.
             * This avoids storing it anywhere and keeps it out of our
             * test output.
             * To do this, we use a stream that just writes to nowhere.
             *
             * If you want to test logging, you can jest.spy on the logger's
             * log method, or any other of its more specific logging methods.
             */
            const sink = new stream.Writable({write: () => {}});
            // This is a hack to make our writable stream work $FlowFixMe
            sink._write = sink.write;
            return new winston.transports.Stream({
                format: getFormatters("test"),
                stream: sink,
            });

        case "development":
            /**
             * If we're in dev mode, just use a console transport.
             */
            return new winston.transports.Console({
                format: getFormatters("development"),
            });

        case "production":
            /**
             * We must be in production, so we will use the Stackdriver logging
             * setup.
             *
             * If using the Google-provided middleware that adds a log property
             * to the express request, make sure this transport is passed to
             * that middleware so that it doesn't add its own.
             */
            return new lw.LoggingWinston();
    }
};

/**
 * Create a logger for the given runtime mode and log level.
 */
export const createLogger = (
    runtimeMode: Runtime,
    logLevel: LogLevel = "debug",
): Logger => {
    const winstonLogger = winston.createLogger<NpmLogLevels>({
        level: logLevel,
        transports: getTransport(runtimeMode),
    });

    winstonLogger.debug(
        `Created logger (Level=${logLevel} Mode=${runtimeMode})`,
    );

    return winstonLogger;
};
