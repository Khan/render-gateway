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
