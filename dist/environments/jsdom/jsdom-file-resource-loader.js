"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSDOMFileResourceLoader = void 0;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _util = require("util");
var _jsdom = require("jsdom");
var _wonderStuffCore = require("@khanacademy/wonder-stuff-core");
var _applyAbortablePromisesPatch = require("./apply-abortable-promises-patch.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
const readFileAsync = (0, _util.promisify)(_fs.default.readFile);

/**
 * A ResourceLoader implementation for JSDOM that loads files from disk.
 */
class JSDOMFileResourceLoader extends _jsdom.ResourceLoader {
  /**
   * Create instance of the resource loader.
   *
   * @param {string} rootFolder
   * The root of where we will load files.
   */
  constructor(rootFolder) {
    // Patch before super to make sure promises get an abort.
    (0, _applyAbortablePromisesPatch.applyAbortablePromisesPatch)();
    super();
    _defineProperty(this, "_rootFolder", void 0);
    _defineProperty(this, "_makeFilePath", url => {
      /**
       * If the url is a url, we are going to use it as a file path from root.
       *
       * If it is an absolute path, we just use it, otherwise we treat it
       * as a relative path from root.
       */
      if (_path.default.isAbsolute(url)) {
        return url;
      }
      try {
        const parsedURL = new URL(url);
        return _path.default.normalize(_path.default.join(this._rootFolder, parsedURL.pathname));
      } catch (e) {
        /* nothing */
      }

      // Assume relative path
      return _path.default.normalize(_path.default.join(this._rootFolder, url));
    });
    if (!_fs.default.existsSync(rootFolder)) {
      throw new _wonderStuffCore.KindError("Root folder cannot be found", _wonderStuffCore.Errors.NotFound);
    }
    this._rootFolder = rootFolder;
  }
  fetch(url, options) {
    const filePath = this._makeFilePath(url);
    return readFileAsync(filePath);
  }
}
exports.JSDOMFileResourceLoader = JSDOMFileResourceLoader;
//# sourceMappingURL=jsdom-file-resource-loader.js.map