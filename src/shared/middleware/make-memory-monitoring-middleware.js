// @flow
import type {Middleware, $Request, $Response, NextFunction} from "express";
import {getRequestLogger} from "../get-request-logger.js";
import {shutdownGateway} from "../shutdown.js";
import type {Logger, RequestWithLog} from "../types.js";

/**
 * Check to see if there are ENV variables specified to limit the total
 * memory usage of a process. We look at the GAE_MEMORY_MB and MIN_FREE_MB
 * variables to compute out the maximum amount of memory this process
 * should be using. Then we compare it against what is actually being used
 * and if it's above that threshold we shutdown the server.
 */
export const makeMemoryMonitoringMiddleware = <
    TReq: RequestWithLog<$Request>,
    TRes: $Response,
>(
    rootlogger: Logger,
): ?Middleware<TReq, TRes> => {
    const {GAE_MEMORY_MB, MIN_FREE_MB} = process.env;
    if (!GAE_MEMORY_MB || !MIN_FREE_MB) {
        // We don't add this if these env vars aren't available.
        rootlogger.info(
            "Memory monitoring disabled. Required environment variables unavailable.",
        );
        return null;
    }

    rootlogger.info(`Creating memory monitoring middleware`, {
        GAE_MEMORY_MB,
        MIN_FREE_MB,
    });

    const middleware: <TReq: RequestWithLog<$Request>, TRes: $Response>(
        req: TReq,
        res: TRes,
        next: NextFunction,
    ) => Promise<void> = async (req, res, next) => {
        // We tell the client to not keep the connection alive, this will
        // ensure that we're able to shutdown the server as soon as the
        // request has completed.
        res.set("Connection", "close");

        const logger = getRequestLogger(rootlogger, req);

        const gaeLimitBytes = parseFloat(GAE_MEMORY_MB) * 1024 * 1024;
        const minFreeBytes = parseFloat(MIN_FREE_MB) * 1024 * 1024;
        const maxAllowedBytes = gaeLimitBytes - minFreeBytes;
        const totalUsageBytes = process.memoryUsage().rss;

        // We check to see if the total memory usage for this process is
        // higher than what's allowed and, if so, we shut it down gracefully
        if (totalUsageBytes >= maxAllowedBytes) {
            logger.warn("Memory usage is exceeding maximum.", {
                totalUsageBytes,
                maxAllowedBytes,
            });
            await shutdownGateway(logger);
        } else {
            logger.info("Memory usage is within bounds.", {
                maxAllowedBytes,
                totalUsageBytes,
            });
        }
        next();
    };
    return middleware;
};
