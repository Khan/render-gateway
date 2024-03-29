"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Environments", {
  enumerable: true,
  get: function () {
    return _index.Environments;
  }
});
exports.Requests = void 0;
Object.defineProperty(exports, "extractError", {
  enumerable: true,
  get: function () {
    return _extractError.extractError;
  }
});
Object.defineProperty(exports, "runServer", {
  enumerable: true,
  get: function () {
    return _runServer.runServer;
  }
});
require("./start-trace-agent.js");
var _Requests = _interopRequireWildcard(require("./request.js"));
exports.Requests = _Requests;
var _extractError = require("./extract-error.js");
var _runServer = require("./run-server.js");
var _index = require("./environments/index.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//# sourceMappingURL=index.js.map