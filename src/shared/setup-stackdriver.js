// @flow
import type {Runtime} from "./types.js";

/**
 * Setup stackdriver integrations.
 */
export const setupStackdriver = async (mode: Runtime): Promise<void> => {
    if (mode !== "production") {
        return;
    }

    const debugAgent = await import("@google-cloud/debug-agent");
    debugAgent.start({allowExpressions: true});

    const profiler = await import("@google-cloud/profiler");
    profiler.start();
};
