// @flow
import type {$Request} from "express";
import KAError from "./ka-error.js";
import {Errors} from "./errors.js";
import type {Logger, RequestWithLog} from "./types.js";

export const getRequestLogger = <TReq: RequestWithLog<$Request>>(
    defaultLogger: ?Logger,
    request?: TReq,
): Logger => {
    if (defaultLogger == null) {
        if (request == null || request.log == null) {
            throw new KAError("No logs available", Errors.Internal);
        }
        return request.log;
    }
    return request != null && request.log != null ? request.log : defaultLogger;
};
