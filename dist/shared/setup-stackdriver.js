"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupStackdriver = void 0;

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Setup stackdriver integrations.
 */
const setupStackdriver = async mode => {
  if (mode !== "production") {
    return;
  }

  const debugAgent = await Promise.resolve().then(() => _interopRequireWildcard(require("@google-cloud/debug-agent")));
  debugAgent.start({
    allowExpressions: true
  });
  const profiler = await Promise.resolve().then(() => _interopRequireWildcard(require("@google-cloud/profiler")));
  profiler.start();
};

exports.setupStackdriver = setupStackdriver;
//# sourceMappingURL=setup-stackdriver.js.map