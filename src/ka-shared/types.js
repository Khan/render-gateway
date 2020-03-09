// @flow
/**
 * A secret that is a string.
 *
 * This opaque type makes it clearer when secrets are being used and enforces
 * the need for explicit casting if they must be used as a string.
 */
export opaque type SecretString = string;

/**
 * A named secret and its value.
 */
export type Secret = {
    /**
     * The name of the secret.
     */
    name: string,

    /**
     * The secret. 🤫ssshhhhh!
     */
    value: SecretString,
};

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
