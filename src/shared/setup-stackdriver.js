// @flow
import type {Runtime, CloudOptions} from "./types.js";

/**
 * Setup stackdriver integrations.
 */
export const setupStackdriver = async (
    mode: Runtime,
    options: ?CloudOptions,
): Promise<void> => {
    if (mode !== "production") {
        return;
    }

    if (options?.debugAgent) {
        const debugAgent = await import("@google-cloud/debug-agent");
        debugAgent.start({allowExpressions: true});
    }

    if (options?.profiler) {
        const profiler = await import("@google-cloud/profiler");
        profiler.start();
    }
};
