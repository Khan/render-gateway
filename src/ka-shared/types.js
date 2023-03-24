// @flow
import typeof {Errors} from "./errors.js";

/**
 * What kind of error is being reported.
 *
 * This type represents our error taxonomy:
 *  - https://khanacademy.atlassian.net/wiki/spaces/ENG/pages/150208513/Goliath+Errors+Best+Practices
 */
export type ErrorKind = $Values<Errors>;

/**
 * A secret that is a string.
 *
 * This opaque type makes it clearer when secrets are being used and enforces
 * the need for explicit casting if they must be used as a string.
 */
export opaque type SecretString = string;

/**
 * A collection of secrets keyed by their names.
 */
export type Secrets = {[string]: SecretString, ...};

/**
 * Configuration of secrets lookup.
 *
 * One variation provides a Google Cloud KMS configuration; the other provides
 * means to map secrets dynamically.
 */
export type SecretsConfig =
    | {
          /**
           * A Google Cloud KMS crpyto key path. This is required in
           * production.
           */
          cryptoKeyPath: string,
      }
    | {
          /**
           * The absolute path of the root folder for the service.
           */
          serviceRootPath: string,
          /**
           * A function used to lookup a secret by name.
           */
          lookupFn: (name: string, config: string) => ?SecretString,
      };

export interface WarmUpHandlerFn {
    /**
     * Warm up a new instance of the server.
     */
    (
        headers: $ReadOnly<{
            +[header: string]: string,
            ...
        }>,
    ): Promise<void>;
}
