// @flow
import type {
    NpmLogLevels,
    Logger as WinstonLogger,
    Info as WinstonInfo,
} from "winston";

export type Info = WinstonInfo<NpmLogLevels>;
export type LogLevel = $Keys<NpmLogLevels>;
export type Logger = WinstonLogger<NpmLogLevels>;
export type Runtime = "production" | "test" | "development";
export type GatewayOptions = {
    name: string,
    port: number,
    logger: Logger,
};
