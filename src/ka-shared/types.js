// @flow
export opaque type SecretString = string;
export type Secret = {
    name: string,
    value: SecretString,
};
export type Secrets = {[string]: SecretString, ...};
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
