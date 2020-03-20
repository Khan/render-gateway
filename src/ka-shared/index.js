// @flow
/**
 * These are other files that this "package" makes available for direct
 * import besides this index.js. This list is used to ensure we export flow
 * types for these if they get directly imported.
 *
 * @additional-exports [
 *      "./start-trace-agent.js",
 * ]
 */
export {getLogger} from "./get-logger.js";
export {makeCommonServiceRouter} from "./routes/make-common-service-router.js";
export {getGCloudSecrets} from "./get-gcloud-secrets.js";
export {trace} from "./trace.js";
export {getRuntimeMode} from "./get-runtime-mode.js";

export type {Secrets, SecretString, SecretsConfig} from "./types.js";

/**
 * NOTE: getRuntimeMode and startTraceAgent should be imported directly. They
 * are special cases because startTraceAgent must be used before any other
 * imports and it relies on getRuntimeMode.
 */
