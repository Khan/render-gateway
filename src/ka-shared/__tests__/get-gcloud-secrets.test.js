// @flow
import * as FS from "fs";
import * as Kms from "@google-cloud/kms";
import {getGCloudSecrets} from "../get-gcloud-secrets.js";

jest.mock("fs");
jest.mock("@google-cloud/kms", () => ({
    KeyManagementServiceClient: jest.fn(),
}));

describe("#getGcloudSecrets", () => {
    describe("configuration has cryptoKeyPath", () => {
        it("should read the encrypted secrets file", async () => {
            // Arrange
            const readFileSpy = jest
                .spyOn(FS, "readFile")
                .mockImplementation((_, callback) =>
                    callback(undefined, Buffer.from("SECRETS_FILE_CONTENTS")),
                );
            /**
             * Pretend result needs encoding right or the parsing code is
             * going to throw.
             */
            const pretendResult = {
                plaintext: Buffer.from('{"some": "json"}').toString("base64"),
            };
            const pretendKMSClient = {
                decrypt: jest
                    .fn()
                    .mockReturnValue(Promise.resolve([pretendResult])),
            };
            jest.spyOn(Kms, "KeyManagementServiceClient").mockReturnValue(
                pretendKMSClient,
            );

            // Act
            await getGCloudSecrets({
                cryptoKeyPath: "CRYPTO_PATH",
            });

            // Assert
            expect(readFileSpy).toHaveBeenCalledWith(
                "./secrets.json.enc",
                expect.any(Function),
            );
        });

        it("should use KMS to decrypt the secrets", async () => {
            // Arrange
            jest.spyOn(FS, "readFile").mockImplementation((_, callback) =>
                callback(undefined, Buffer.from("SECRETS_FILE_CONTENTS")),
            );
            /**
             * Pretend result needs encoding right or the parsing code is
             * going to throw.
             */
            const pretendResult = {
                plaintext: Buffer.from('{"some": "json"}').toString("base64"),
            };
            const pretendKMSClient = {
                decrypt: jest
                    .fn()
                    .mockReturnValue(Promise.resolve([pretendResult])),
            };
            jest.spyOn(Kms, "KeyManagementServiceClient").mockReturnValue(
                pretendKMSClient,
            );

            // Act
            await getGCloudSecrets({
                cryptoKeyPath: "CRYPTO_PATH",
            });

            // Assert
            expect(pretendKMSClient.decrypt).toHaveBeenCalledWith({
                name: "CRYPTO_PATH",
                ciphertext: Buffer.from("SECRETS_FILE_CONTENTS").toString(
                    "base64",
                ),
            });
        });

        it("should return the secrets object", async () => {
            // Arrange
            jest.spyOn(FS, "readFile").mockImplementation((_, callback) =>
                callback(undefined, Buffer.from("SECRETS_FILE_CONTENTS")),
            );
            /**
             * Pretend result needs encoding right or the parsing code is
             * going to throw.
             */
            const pretendResult = {
                plaintext: Buffer.from('{"some": "json"}').toString("base64"),
            };
            const pretendKMSClient = {
                decrypt: jest
                    .fn()
                    .mockReturnValue(Promise.resolve([pretendResult])),
            };
            jest.spyOn(Kms, "KeyManagementServiceClient").mockReturnValue(
                pretendKMSClient,
            );

            // Act
            const result = await getGCloudSecrets({
                cryptoKeyPath: "CRYPTO_PATH",
            });

            // Assert
            expect(result).toStrictEqual({
                some: "json",
            });
        });
    });

    describe("configuration has serviceRootPath", () => {
        it("should read the secrets config file", async () => {
            // Arrange
            const readFileSpy = jest
                .spyOn(FS, "readFile")
                .mockImplementation((_, callback) =>
                    callback(
                        undefined,
                        JSON.stringify({SECRET_NAME: "SECRET_CONFIG"}),
                    ),
                );

            // Act
            await getGCloudSecrets({
                serviceRootPath: "ROOT_PATH",
                lookupFn: jest.fn((name) => (name: any)),
            });

            // Assert
            expect(readFileSpy).toHaveBeenCalledWith(
                "ROOT_PATH/secrets-config.json",
                expect.any(Function),
            );
        });

        it("should lookup each secret from the config file", async () => {
            // Arrange
            jest.spyOn(FS, "readFile").mockImplementation((_, callback) =>
                callback(
                    undefined,
                    JSON.stringify({
                        SECRET_NAME_1: "SECRET_CONFIG_1",
                        SECRET_NAME_2: "SECRET_CONFIG_2",
                        SECRET_NAME_3: "SECRET_CONFIG_3",
                    }),
                ),
            );
            const lookupFn = jest.fn((name) => (name: any));

            // Act
            await getGCloudSecrets({
                serviceRootPath: "ROOT_PATH",
                lookupFn,
            });

            // Assert
            expect(lookupFn).toHaveBeenCalledWith(
                "SECRET_NAME_1",
                "SECRET_CONFIG_1",
            );
            expect(lookupFn).toHaveBeenCalledWith(
                "SECRET_NAME_2",
                "SECRET_CONFIG_2",
            );
            expect(lookupFn).toHaveBeenCalledWith(
                "SECRET_NAME_3",
                "SECRET_CONFIG_3",
            );
        });

        it("should throw if the lookup returns null", async () => {
            // Arrange
            jest.spyOn(FS, "readFile").mockImplementation((_, callback) =>
                callback(
                    undefined,
                    JSON.stringify({SECRET_NAME_1: "SECRET_CONFIG_1"}),
                ),
            );

            // Act
            const underTest = getGCloudSecrets({
                serviceRootPath: "ROOT_PATH",
                lookupFn: () => null,
            });

            // Assert
            await expect(underTest).rejects.toThrowErrorMatchingInlineSnapshot(
                `"Could not read secret SECRET_NAME_1"`,
            );
        });

        it("should return the looked up secrets", async () => {
            // Arrange
            jest.spyOn(FS, "readFile").mockImplementation((_, callback) =>
                callback(
                    undefined,
                    JSON.stringify({
                        SECRET_NAME_1: "SECRET_CONFIG_1",
                        SECRET_NAME_2: "SECRET_CONFIG_2",
                        SECRET_NAME_3: "SECRET_CONFIG_3",
                    }),
                ),
            );

            // Act
            const result = await getGCloudSecrets({
                serviceRootPath: "ROOT_PATH",
                lookupFn: (name, config) => (config: any),
            });

            // Assert
            expect(result).toStrictEqual({
                SECRET_NAME_1: "SECRET_CONFIG_1",
                SECRET_NAME_2: "SECRET_CONFIG_2",
                SECRET_NAME_3: "SECRET_CONFIG_3",
            });
        });
    });

    describe("configuration is invalid", () => {
        it("should throw", async () => {
            // Arrange
            const pretendBadConfig = ({}: any);

            // Act
            const underTest = () => getGCloudSecrets(pretendBadConfig);

            // Assert
            expect(underTest).toThrowErrorMatchingInlineSnapshot(
                `"Unsupport configuration"`,
            );
        });
    });
});
