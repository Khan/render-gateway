// @flow
import type {NotFoundStatus, OKStatus, RedirectStatus} from "./types.js";

const NotFoundImpl: NotFoundStatus = {
    get code(): 404 {
        return 404;
    },
};

/**
 * Create a 404 NotFound status.
 */
export const notFound = (): NotFoundStatus => NotFoundImpl;

const OKImpl: OKStatus = {
    get code(): 200 {
        return 200;
    },
};

/**
 * Create an 200 OK status.
 */
export const ok = (): OKStatus => OKImpl;

/**
 * Create a Redirect status.
 *
 * @param {string} targetURL The target URL of the redirect.
 * @param {boolean} [isPermanent] If truthy, the status code 301 will be used to
 * indicate a permanent move of the redirected URL; otherwise, the status code
 * 302 will be used, indicating a temporary move. Defaults to false.
 */
export const redirect = (
    targetURL: string,
    isPermanent?: boolean = false,
): RedirectStatus => {
    if (!targetURL) {
        throw new Error("Must provide a target URL for the redirect.");
    }

    const code = isPermanent ? 301 : 302;
    return {
        get code(): 301 | 302 {
            return code;
        },
        get targetURL(): string {
            return targetURL;
        },
    };
};
