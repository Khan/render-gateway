// @flow
import type {$Request, $Response} from "express";
import type {CallbackHandler} from "superagent";
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
 * Options for configuring the keep alive behavior.
 */
export type KeepAliveOptions = {
    /**
     * Sets the working socket to timeout after workingSocketTimeout
     * milliseconds of inactivity on the working socket.
     * Default is freeSocketTimeout * 2.
     */
    workingSocketTimeout?: number,

    /**
     * Sets the free socket to timeout after freeSocketTimeout milliseconds
     * of inactivity on the free socket. Default is 15000.
     */
    freeSocketTimeout?: number,

    /**
     * Maximum number of sockets to allow per host. Default is Infinity.
     */
    maxSockets?: number,

    /**
     * Maximum number of sockets (per host) to leave open in a free state.
     * Default is 256.
     */
    maxFreeSockets?: number,
};

/**
 * Options to configure the request caching strategy.
 */
export type CachingStrategy = {
    /**
     * The superagent-cache-plugin-compatible cache that will be used as the
     * cache implementation.
     */
    provider: mixed,

    /**
     * A callback to calculate when the cached response for a given URL should
     * expire. If this method is omitted, the cache provider's default
     * expiration will be used. The result is given to superagent-cache-plugin
     * and works according to its documentation.
     *
     * https://github.com/jpodwys/superagent-cache-plugin/tree/02e41c5b98c89318133d4736b2bd1abcc1866bab
     */
    getExpiration?: (url: string) => ?number,

    /**
     * A callback used to determine if a particular URL's result should be
     * cached or not. This defaults to only allowing JS file extensions to be
     * stored. This callback should return null for the default behavior to
     * apply.
     */
    isCacheable?: (url: string) => ?boolean,
};

/**
 * A promise that has an abort() method.
 */
export interface AbortablePromise<T> extends Promise<T> {
    abort: () => void;
}

/**
 * Options to configure the request agent that is used by the gateway
 * to make requests to external services.
 *
 * All requests go through the same request agent, whether for files or data.
 * The agent has some basic configuration. These options provide mechanisms to
 * extend that base configuration so that caching strategies and the like
 * can be defined or modified.
 */
export type RequestsOptions = {
    /**
     * Options to define the caching strategy for requests.
     */
    caching?: CachingStrategy,

    /**
     * Options to configure the keep alive behavior.
     * If omitted, default values are used (see documentation of
     * KeepAliveOptions for details of defaults).
     */
    keepAlive?: KeepAliveOptions,

    /**
     * Time to wait in milliseconds before a request times out.
     * Defaults to 60000 (1 minute).
     */
    timeout?: number,

    /**
     * The number of times a request is retried if it fails from a transient
     * error. This is in addition to the initial request. For example, if this
     * were set to 3, then there could be a total of 4 requests.
     * Note that for all GET requests made during server-side rendering,
     * it is assumed they will be idempotent. Defaults to 2 (i.e. one try, and
     * two retries - so three total requests).
     */
    retries?: number,

    /**
     * Callback invoked if a retry occurs.
     * This should return null for the default behavior to apply, true to allow
     * the retry, and false to block further retries.
     *
     * Returning a non-boolean value causes superagent to do its default
     * behavior, which is:
     * - allow retry for all 500 errors except 501
     * - allow retry for err.code set to any:
     *      ['ECONNRESET', 'ETIMEDOUT', 'EADDRINFO', 'ESOCKETTIMEDOUT']
     * - allow retry if err.timeout is truthy and err.code is 'ECONNABORTED`
     * - allow retry if err.crossDomain is truthy
     */
    shouldRetry?: CallbackHandler,
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

    /**
     * Options to control how requests made from the gateway to external
     * resources are managed.
     *
     * If omitted, no request caching will occur and default values will
     * be provided. See the RequestsOptions type for details of defaults.
     */
    requests?: RequestsOptions,
};

/**
 * The request type that we use with express.
 */
export type Request = RequestWithLog<$Request>;

/**
 * The response type that we use with express.
 */
export type Response = $Response;
