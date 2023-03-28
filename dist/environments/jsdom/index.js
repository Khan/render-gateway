"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSDOM = void 0;
var _jsdomConfiguration = require("./jsdom-configuration.js");
var _jsdomEnvironment = require("./jsdom-environment.js");
var _jsdomResourceLoader = require("./jsdom-resource-loader.js");
var _jsdomFileResourceLoader = require("./jsdom-file-resource-loader.js");
const JSDOM = {
  Configuration: _jsdomConfiguration.JSDOMConfiguration,
  Environment: _jsdomEnvironment.JSDOMEnvironment,
  ResourceLoader: _jsdomResourceLoader.JSDOMResourceLoader,
  FileResourceLoader: _jsdomFileResourceLoader.JSDOMFileResourceLoader
};
exports.JSDOM = JSDOM;
//# sourceMappingURL=index.js.map