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

    if (options?.profiler) {
        const profiler = await import("@google-cloud/profiler");
        profiler.start();
    }
};
