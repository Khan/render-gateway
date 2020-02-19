// @flow
/**
 * Import only the file we want.
 * This is because this is used to setup the trace agent, and that has to be
 * imported before other things like express, so we don't want to import
 * shared/index.js before that.
 */
import {getRuntimeMode as getNodeRuntimeMode} from "../shared/get-runtime-mode.js";

import type {Runtime} from "../shared/index.js";

/**
 * Get the runtime mode based off process.env.NODE_ENV or KA_IS_DEV_SERVER.
 */
export const getRuntimeMode = (): Runtime =>
    getNodeRuntimeMode(
        process.env.KA_IS_DEV_SERVER === "1" ? "development" : "production",
    );
