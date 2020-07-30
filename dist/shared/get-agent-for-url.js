"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAgentForURL = void 0;

var _errors = require("./errors.js");

var _kaError = _interopRequireDefault(require("./ka-error.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * Get a new agent to use for a given URL.
 *
 * For keep-alive behavior to work, the agent must be shared across requests
 * but this is left for the calling code to manage. We do this because once the
 * agent isn't needed (such as at the end of a request), we want to destroy it.
 * Otherwise, it can hang around keeping sockets open which can lead to
 * retaining large chunks of memory and creating memory leaks.
 */
const getAgentForURL = url => {
  const agentOptions = {
    keepAlive: true
  };

  switch (url.protocol) {
    case "http:":
      const http = require("http");

      return new http.Agent(agentOptions);

    case "https:":
      const https = require("https");

      return new https.Agent(agentOptions);

    default:
      throw new _kaError.default(`Unsupported protocol: ${url.protocol}`, _errors.Errors.Internal);
  }
};

exports.getAgentForURL = getAgentForURL;
//# sourceMappingURL=get-agent-for-url.js.map