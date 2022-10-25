"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.safeHasOwnProperty = void 0;
/**
 * Wrapper to Object.prototype.hasOwnProperty so we only need suppress flow once
 */
const safeHasOwnProperty = (obj, property) =>
// $FlowIgnore[method-unbinding]
Object.prototype.hasOwnProperty.call(obj, property);
exports.safeHasOwnProperty = safeHasOwnProperty;
//# sourceMappingURL=safe-has-own-property.js.map