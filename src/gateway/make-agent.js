// @flow
import agentkeepalive from "agentkeepalive";
import type {KeepAliveOptions} from "./types.js";

/**
 * Set up an agent that can be used to make requests.
 *
 * Takes a options. If these options are omitted or falsy, then no caching will
 * occur and a variety of defaults will be used.
 */
export const makeAgent = (options?: ?KeepAliveOptions): agentkeepalive =>
    new agentkeepalive({
        keepAlive: true,
        timeout: options?.workingSocketTimeout,
        freeSocketTimeout: options?.freeSocketTimeout,
        maxSockets: options?.maxSockets,
        maxFreeSockets: options?.maxFreeSockets,
    });
