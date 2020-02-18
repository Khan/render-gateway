// @flow
import {getRuntimeMode as getNodeRuntimeMode} from "../shared/index.js";

import type {Runtime} from "../shared/index.js";

/**
 * Get the runtime mode based off process.env.NODE_ENV or KA_IS_DEV_SERVER.
 */
export const getRuntimeMode = (): Runtime =>
    getNodeRuntimeMode(
        process.env.KA_IS_DEV_SERVER === "0" ? "production" : "development",
    );
