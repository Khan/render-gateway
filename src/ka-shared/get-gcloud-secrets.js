// @flow
/**
 * Utilities for reading secrets from secrets files.
 */
import fs from "fs";
import path from "path";
import {promisify} from "util";
import kms from "@google-cloud/kms";

import type {SecretsConfig, Secrets, SecretString} from "./types.js";

const readFile = promisify(fs.readFile);

/**
 * Look up secrets during development.
 *
 * This assumes a secrets-config.json file exists and then uses the given
 * lookupFn to map them to dev secrets.
 */
const secretsForDev = async (
    serviceRootPath: string,
    lookupFn: (name: string) => ?SecretString,
): Secrets => {
    // $FlowIgnore
    const secretsNames = require(path.join(path, "secrets-config.json"));

    const secrets: Secrets = {};
    Object.keys(secretsNames).forEach((name) => {
        const secret = lookupFn(name);
        if (!secret) {
            throw new Error(`Could not read secret ${name}`);
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
const secretsForProd = async (cryptoKeyPath: string): Secrets => {
    const client = new kms.KeyManagementServiceClient();
    const contentsBuffer = await readFile("./secrets.json.enc");
    const ciphertext = contentsBuffer.toString("base64");
    const [result] = await client.decrypt({name: cryptoKeyPath, ciphertext});
    return JSON.parse(Buffer.from(result.plaintext, "base64"));
};

/**
 * Get secrets
 */
export const getGCloudSecrets = (config: SecretsConfig): Secrets => {
    if (config.cryptoKeyPath) {
        return secretsForProd(config.cryptoKeyPath);
    } else if (config.serviceRootPath) {
        return secretsForDev(config.serviceRootPath, config.lookupFn);
    }

    throw new Error("Unsupport configuration");
};
