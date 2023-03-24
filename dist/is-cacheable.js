"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isCacheable = void 0;
const isCacheable = (url, overrideFn) => {
  const override = overrideFn === null || overrideFn === void 0 ? void 0 : overrideFn(url);
  if (override != null) {
    return override;
  }

  /**
   * For now, let's just cache JS files.
   */
  const JSFileRegex = /^.*\.js(?:\?.*)?$/g;
  return JSFileRegex.test(url);
};
exports.isCacheable = isCacheable;
//# sourceMappingURL=is-cacheable.js.map