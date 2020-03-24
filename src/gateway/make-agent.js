// @flow
import {HttpsAgent} from "agentkeepalive";
import type {KeepAliveOptions} from "./types.js";

/**
 * Set up an HTTPS agent that can be used to make requests.
 *
 * Takes options. If these options are omitted or falsy, then the
 * agentkeepalive defaults will be used.
 */
export const makeAgent = (options?: ?KeepAliveOptions): HttpsAgent =>
    new HttpsAgent({
        keepAlive: true,
        timeout: options?.workingSocketTimeout,
        freeSocketTimeout: options?.freeSocketTimeout,
        maxSockets: options?.maxSockets,
        maxFreeSockets: options?.maxFreeSockets,
    });
