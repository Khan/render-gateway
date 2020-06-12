"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSDOMSixteen = void 0;

var _jsdomSixteenConfiguration = require("./jsdom-sixteen-configuration.js");

var _jsdomSixteenEnvironment = require("./jsdom-sixteen-environment.js");

var _jsdomSixteenResourceLoader = require("./jsdom-sixteen-resource-loader.js");

var _jsdomSixteenFileResourceLoader = require("./jsdom-sixteen-file-resource-loader.js");

const JSDOMSixteen = {
  Configuration: _jsdomSixteenConfiguration.JSDOMSixteenConfiguration,
  Environment: _jsdomSixteenEnvironment.JSDOMSixteenEnvironment,
  ResourceLoader: _jsdomSixteenResourceLoader.JSDOMSixteenResourceLoader,
  FileResourceLoader: _jsdomSixteenFileResourceLoader.JSDOMSixteenFileResourceLoader
};
exports.JSDOMSixteen = JSDOMSixteen;
//# sourceMappingURL=index.js.map