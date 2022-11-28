"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRootLogger = exports.getRootLogger = void 0;
var _kaError = _interopRequireDefault(require("./ka-error.js"));
var _errors = require("./errors.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
let rootLogger = null;
const getRootLogger = () => rootLogger;
exports.getRootLogger = getRootLogger;
const setRootLogger = logger => {
  if (rootLogger != null) {
    throw new _kaError.default("Root logger already set. Can only be set once per gateway.", _errors.Errors.Internal);
  }
  rootLogger = logger;
};
exports.setRootLogger = setRootLogger;
//# sourceMappingURL=root-logger.js.map