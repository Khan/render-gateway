// @flow
import {getRuntimeMode as getNodeRuntimeMode} from "../shared/get-runtime-mode.js";

import type {Runtime} from "../shared/types.js";

/**
 * Get the runtime mode based off process.env.NODE_ENV or KA_IS_DEV_SERVER.
 */
export const getRuntimeMode = (): Runtime =>
    getNodeRuntimeMode(
        process.env.KA_IS_DEV_SERVER === "0" ? "production" : "development",
    );
