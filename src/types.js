// @flow
import type {$Request, $Response} from "express";
import type {RequestWithLog} from "./shared/index.js";

/**
 * Options for configuring incoming request authentication.
 */
export type AuthenticationOptions = {
    /**
     * The key of the secret that must be matched.
     *
     * This secret is loaded from the secrets.json.enc file that the service
     * must provide.
     */
    secretKey: string,

    /**
     * The name of the header to be matched.
     *
     * This is a header in the request, the value of which will be matched
     * against the secret identified by `secretKey`.
     */
    headerName: string,

    /**
     * The Google Cloud KMS cryptography key path.
     *
     * This is the KMS path used to decode the secrets.json.enc file so that
     * the secret identifed by `secretKey` can be obtained.
     */
    cryptoKeyPath: string,
};

/**
 * Options for configuring the gateway.
 */
export type RenderGatewayOptions = {
    /**
     * The name of the gateway service.
     */
    name: string,

    /**
     * The port on which the gateway service will listen.
     */
    port: number,

    /**
     * Options to indicate how to authenticate incoming render requests.
     * When omitted, requests are not authenticated (useful for dev and test).
     * These are strongly recommended for production.
     */
    authentication?: AuthenticationOptions,
};

/**
 * The request type that we use with express.
 */
export type Request = RequestWithLog<$Request>;

/**
 * The response type that we use with express.
 */
export type Response = $Response;
