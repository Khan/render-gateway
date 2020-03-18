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
exports.StatusCodes = void 0;

require("./ka-shared/start-trace-agent.js");

var Statuses = _interopRequireWildcard(require("./status-codes.js"));

var _runServer = require("./run-server.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Trace agent is a special case where it must be imported first to ensure
 * correct instrumentation of other imported modules.
 */
// eslint-disable-next-line import/no-unassigned-import
const StatusCodes = Statuses;
exports.StatusCodes = StatusCodes;
//# sourceMappingURL=index.js.map