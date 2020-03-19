// @flow
import * as KAShared from "../ka-shared/index.js";
import {getSecrets} from "../get-secrets.js";

jest.mock("../ka-shared/index.js");

describe("#getSecrets", () => {
    describe("in production", () => {
        it("should lookup secrets with crypto key path", () => {
            // Arrange
            jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue(
                "production",
            );
            const getGCloudSecretsSpy = jest.spyOn(
                KAShared,
                "getGCloudSecrets",
            );

            // Act
            getSecrets("CRYPTO_KEY_PATH");

            // Assert
            expect(getGCloudSecretsSpy).toHaveBeenCalledWith({
                cryptoKeyPath: "CRYPTO_KEY_PATH",
            });
        });
    });

    describe("not in production", () => {
        it("should lookup secrets with render-gateway root path", () => {
            // Arrange
            jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue(
                "development",
            );
            const getGCloudSecretsSpy = jest.spyOn(
                KAShared,
                "getGCloudSecrets",
            );

            // Act
            getSecrets("CRYPTO_KEY_PATH");

            // Assert
            expect(getGCloudSecretsSpy).toHaveBeenCalledWith({
                serviceRootPath: "",
                lookupFn: expect.any(Function),
            });
        });

        it("should lookup secrets with lookupFn that returns null", async () => {
            // Arrange
            jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue(
                "development",
            );
            const getGCloudSecretsSpy = jest.spyOn(
                KAShared,
                "getGCloudSecrets",
            );
            getSecrets("CRYPTO_KEY_PATH");
            const lookupFn = getGCloudSecretsSpy.mock.calls[0][0].lookupFn;

            // Act
            const result = lookupFn();

            // Assert
            expect(result).toBeNull();
        });
    });
});
