"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRootLogger = exports.getRootLogger = void 0;
let rootLogger = null;

const getRootLogger = () => rootLogger;

exports.getRootLogger = getRootLogger;

const setRootLogger = logger => {
  if (rootLogger != null) {
    throw new Error("Root logger already set. Can only be set once per gateway.");
  }

  rootLogger = logger;
};

exports.setRootLogger = setRootLogger;
//# sourceMappingURL=root-logger.js.map