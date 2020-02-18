// @flow
import type {$Request} from "express";
import type {Logger, RequestWithLog} from "./types.js";

export const getRequestLogger = <TReq: RequestWithLog<$Request>>(
    defaultLogger: Logger,
    request?: TReq,
): Logger =>
    request != null && request.log != null ? request.log : defaultLogger;
