// @flow
import type {URL} from "url";
import type {Agent as HttpAgent} from "http";
import type {Agent as HttpsAgent} from "https";

/**
 * When making requests from one Node service to other services, we have seen
 * some long delays establishing TCP connections to the load balancer of those
 * backends. To try and workaround the problem, we ensure the keepAlive option
 * of the agent is set. It is hoped that this will re-use a recently released
 * socket instead of creating a new one on each request.
 *
 * If a socket is not available, the agent will automatically create a new one.
 * If increased load on the Node service results in similar connection delays,
 * we may consider setting maxSockets to instruct the agent to limit the
 * number of sockets created per destination host.
 *
 * NOTE: agentkeepalive and http/2 have been tried with superagent to see if
 * we could utilize those approaches, which provide more persistent connections.
 * However, App Engine/load balancer appear to interrupt the creation of these
 * persistent connections. It could be that the relevant ports need to be
 * listened on for that to work correctly, so further investigation into those
 * options might bear some fruit.
 *
 * For now, we do this.
 */

let httpAgent;
let httpsAgent;

/**
 * Get an agent to use for a given URL.
 *
 * For keep-alive behavior to work, the agent must be shared across requests.
 * Therefore, the returned agent (one per protocol - http or https) will be
 * the same on repeated requests.
 *
 * Agents are created on first request.
 */
export const getAgentForURL = (url: URL): HttpAgent | HttpsAgent => {
    const agentOptions = {keepAlive: true};
    switch (url.protocol) {
        case "http:":
            if (httpAgent == null) {
                const http = require("http");
                httpAgent = new http.Agent(agentOptions);
            }
            return httpAgent;

        case "https:":
            if (httpsAgent == null) {
                const https = require("https");
                httpsAgent = new https.Agent(agentOptions);
            }
            return httpsAgent;

        default:
            throw new Error(`Unsupported protocol: ${url.protocol}`);
    }
};
