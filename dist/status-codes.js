"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.redirect = exports.ok = exports.notFound = void 0;
const NotFoundImpl = {
  get code() {
    return 404;
  }

};
/**
 * Create a 404 NotFound status.
 */

const notFound = () => NotFoundImpl;

exports.notFound = notFound;
const OKImpl = {
  get code() {
    return 200;
  }

};
/**
 * Create an 200 OK status.
 */

const ok = () => OKImpl;
/**
 * Create a Redirect status.
 *
 * @param {string} targetURL The target URL of the redirect.
 * @param {boolean} [isPermanent] If truthy, the status code 301 will be used to
 * indicate a permanent move of the redirected URL; otherwise, the status code
 * 302 will be used, indicating a temporary move. Defaults to false.
 */


exports.ok = ok;

const redirect = (targetURL, isPermanent = false) => {
  if (!targetURL) {
    throw new Error("Must provide a target URL for the redirect.");
  }

  const code = isPermanent ? 301 : 302;
  return {
    get code() {
      return code;
    },

    get targetURL() {
      return targetURL;
    }

  };
};

exports.redirect = redirect;
//# sourceMappingURL=status-codes.js.map