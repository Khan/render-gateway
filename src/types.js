// @flow
import type {$Request, $Response} from "express";
import type {RequestWithLog} from "./shared/index.js";

export type AuthenticationOptions = {
    secretKey: string,
    headerName: string,
    cryptoKeyPath: string,
};

export type RenderGatewayOptions = {
    name: string,
    port: number,
    authentication?: AuthenticationOptions,
};

export type Request = RequestWithLog<$Request>;
export type Response = $Response;
