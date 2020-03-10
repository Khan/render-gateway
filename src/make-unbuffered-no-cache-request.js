// @flow
import superagent from "superagent";
import type {SuperAgentRequest} from "superagent";
import {makeAgent} from "./make-agent.js";
import type {RenderGatewayOptions} from "./types.js";
import {makeShouldRetry} from "./make-should-retry.js";
import type {Logger} from "./shared/index.js";

/**
 * Make a request for a given URL without buffering or caching.
 *
 * This is not intended for direct use. Use makeRequest.
 *
 * @param {RenderGatewayOptions} options The options used to start the gateway.
 * @param {string} url The URL to be requested.
 * @param {Logger} logger The logger to use.
 * @returns {SuperAgentRequest} A superagent request for the URL.
 */
export const makeUnbufferedNoCacheRequest = (
    options: RenderGatewayOptions,
    url: string,
    logger: Logger,
): SuperAgentRequest => {
    const {name: gatewayName, requests: requestOptions} = options;

    // Get an agent.
    const agent = makeAgent(requestOptions?.keepAlive);

    // Build our main fetcher using the configured agent.
    return (
        superagent
            .agent(agent)
            .get(url)
            /**
             * Configure retries since superagent can handle this for us.
             * We give it a callback so we can log the retry and, if we so choose
             * in the future, decide whether we should allow any more. This would
             * allow us to short circuit the retry count (the max retries still
             * takes precedence over our callback response, so we can't retry
             * forever).
             */
            .retry(requestOptions?.retries || 2, makeShouldRetry(logger))
            /**
             * We add a user agent header so that we can easily identify our
             * requests in logs.
             *
             * The header has a form like:
             *     gateway-name (GAE_VERSION_STRING_HERE)
             */
            .set(
                "User-Agent",
                `${gatewayName} (${process.env.GAE_VERSION || "UNKNOWN"})`,
            )
            /**
             * Our default timeout is 1 minute, but we allow for it to be
             * overridden by gateway options.
             */
            .timeout(requestOptions?.timeout || 60000)
    );
};
