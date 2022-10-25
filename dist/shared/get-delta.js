"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDelta = void 0;

const getDelta = (first, second) => {
  const result = {};
  for (const key of Object.keys(first)) {
    result[key] = second[key] - first[key];
  }
  return result;
};
exports.getDelta = getDelta;
//# sourceMappingURL=get-delta.js.map