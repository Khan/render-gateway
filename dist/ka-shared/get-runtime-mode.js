"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRuntimeMode = void 0;
var _getRuntimeMode = require("../shared/get-runtime-mode.js");
/**
 * Import only the file we want.
 * This is because this is used to setup the trace agent, and that has to be
 * imported before other things like express, so we don't want to import
 * shared/index.js before that.
 */

/**
 * Get the runtime mode based off process.env.NODE_ENV or KA_IS_DEV_SERVER.
 */
const getRuntimeMode = () => (0, _getRuntimeMode.getRuntimeMode)(process.env.KA_IS_DEV_SERVER === "1" ? "development" : "production");
exports.getRuntimeMode = getRuntimeMode;
//# sourceMappingURL=get-runtime-mode.js.map