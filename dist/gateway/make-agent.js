"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeAgent = void 0;

var _agentkeepalive = require("agentkeepalive");

/**
 * Set up an HTTPS agent that can be used to make requests.
 *
 * Takes options. If these options are omitted or falsy, then the
 * agentkeepalive defaults will be used.
 */
const makeAgent = options => new _agentkeepalive.HttpsAgent({
  keepAlive: true,
  timeout: options === null || options === void 0 ? void 0 : options.workingSocketTimeout,
  freeSocketTimeout: options === null || options === void 0 ? void 0 : options.freeSocketTimeout,
  maxSockets: options === null || options === void 0 ? void 0 : options.maxSockets,
  maxFreeSockets: options === null || options === void 0 ? void 0 : options.maxFreeSockets
});

exports.makeAgent = makeAgent;
//# sourceMappingURL=make-agent.js.map