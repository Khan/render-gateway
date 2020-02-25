// @flow
import ancesdir from "ancesdir";
import {getGCloudSecrets} from "./ka-shared/index.js";
import {getRuntimeMode} from "./ka-shared/get-runtime-mode.js";

import type {Secrets} from "./ka-shared/index.js";

/**
 * Get the secrets table for the service.
 */
export const getSecrets = (): Secrets => {
    switch (getRuntimeMode()) {
        case "production":
            return getGCloudSecrets({
                cryptoKeyPath:
                    "projects/khan-academy/locations/global/keyRings/secrets/cryptoKeys/render-gateway",
            });

        default:
            /**
             * This should never get called, but I wanted to demonstrate
             * call usage. We therefore return null from the lookupFn to ensure
             * we'll get an error if this ever gets hit.
             */
            return getGCloudSecrets({
                serviceRootPath: ancesdir(__dirname),
                lookupFn: () => null,
            });
    }
};
