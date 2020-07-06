// @flow
import type {$Request} from "express";
import type {Logger, RequestWithLog} from "./types.js";

export const getRequestLogger = <TReq: RequestWithLog<$Request>>(
    defaultLogger: ?Logger,
    request?: TReq,
): Logger => {
    if (defaultLogger == null) {
        if (request == null || request.log == null) {
            throw new Error("No logs available");
        }
        return request.log;
    }
    return request != null && request.log != null ? request.log : defaultLogger;
};
