// @flow
import type {Request, Response} from "../types.js";
import {getLogger} from "../ka-shared/index.js";

/**
 * Handle a request as a render.
 *
 * This method orchestrates the download and setup of a render environment
 * and the subsequent rendering process. The downloaded code is responsible for
 * the actual render operation.
 *
 * This is expected to be wrapped with express-async-handler.
 */
export async function renderHandler(
    req: Request,
    res: Response,
): Promise<void> {
    // TODO(somewhatabstract): Use profiling API to trace this.
    getLogger(req).debug(`RENDER: ${req.url}`);

    // OK, so it's not async yet. But it will be, eventually.
    res.send(`The URL you requested was ${req.url}`);
}
