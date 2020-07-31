// @flow
/**
 * Utilities for reading secrets from secrets files.
 */
import path from "path";
import kms from "@google-cloud/kms";
import {Errors} from "./errors.js";
import {KAError} from "../shared/index.js";
import {readFile} from "./read-file.js";

import type {SecretsConfig, Secrets, SecretString} from "./types.js";

/**
 * Look up secrets during development.
 *
 * This assumes a secrets-config.json file exists and then uses the given
 * lookupFn to map them to dev secrets.
 */
const secretsForDev = async (
    serviceRootPath: string,
    lookupFn: (name: string, config: string) => ?SecretString,
): Promise<Secrets> => {
    // NOTE(somewhatabstract): It's convenient to use require here since that
    // already understands JSON, but that's harder to test. This way we get
    // the same functionality but we can actually test it.
    const configBuffer = await readFile(
        path.join(serviceRootPath, "secrets-config.json"),
    );
    const secretsConfig = JSON.parse(configBuffer.toString());

    const secrets: Secrets = {};
    Object.keys(secretsConfig).forEach((name) => {
        const secret = lookupFn(name, secretsConfig[name]);
        if (!secret) {
            throw new KAError(`Could not read secret ${name}`, Errors.NotFound);
        }
        secrets[name] = secret;
    });

    return secrets;
};

/**
 * Look up secrets during production.
 *
 * This is based on
 * https://cloud.google.com/kms/docs/encrypt-decrypt#kms-howto-encrypt-nodejs
 */
const secretsForProd = async (cryptoKeyPath: string): Promise<Secrets> => {
    const client = new kms.KeyManagementServiceClient();
    const contentsBuffer = await readFile("./secrets.json.enc");
    const ciphertext = contentsBuffer.toString("base64");
    const [result] = await client.decrypt({name: cryptoKeyPath, ciphertext});
    return JSON.parse(Buffer.from(result.plaintext, "base64"));
};

/**
 * Get secrets
 */
export const getGCloudSecrets = (config: SecretsConfig): Promise<Secrets> => {
    if (config.cryptoKeyPath) {
        return secretsForProd(config.cryptoKeyPath);
    } else if (config.serviceRootPath) {
        return secretsForDev(config.serviceRootPath, config.lookupFn);
    }

    throw new KAError("Unsupported configuration", Errors.NotAllowed);
};
