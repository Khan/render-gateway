"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "runServer", {
  enumerable: true,
  get: function () {
    return _runServer.runServer;
  }
});
Object.defineProperty(exports, "Environments", {
  enumerable: true,
  get: function () {
    return _index.Environments;
  }
});
exports.Requests = void 0;

require("../ka-shared/start-trace-agent.js");

var RequestAPI = _interopRequireWildcard(require("./request.js"));

var _runServer = require("./run-server.js");

var _index = require("./environments/index.js");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Trace agent is a special case where it must be imported first to ensure
 * correct instrumentation of other imported modules.
 */
// eslint-disable-next-line import/no-unassigned-import
const Requests = RequestAPI;
exports.Requests = Requests;
//# sourceMappingURL=index.js.map