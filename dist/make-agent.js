"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeAgent = void 0;

var _agentkeepalive = _interopRequireDefault(require("agentkeepalive"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Set up an agent that can be used to make requests.
 *
 * Takes a options. If these options are omitted or falsy, then no caching will
 * occur and a variety of defaults will be used.
 */
const makeAgent = options => new _agentkeepalive.default({
  keepAlive: true,
  timeout: options === null || options === void 0 ? void 0 : options.workingSocketTimeout,
  freeSocketTimeout: options === null || options === void 0 ? void 0 : options.freeSocketTimeout,
  maxSockets: options === null || options === void 0 ? void 0 : options.maxSockets,
  maxFreeSockets: options === null || options === void 0 ? void 0 : options.maxFreeSockets
});

exports.makeAgent = makeAgent;
//# sourceMappingURL=make-agent.js.map