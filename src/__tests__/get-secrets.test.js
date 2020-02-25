// @flow
import * as GetRuntimeMode from "../ka-shared/get-runtime-mode.js";
import * as KAShared from "../ka-shared/index.js";
import {getSecrets} from "../get-secrets.js";

jest.mock("../ka-shared/get-runtime-mode.js");
jest.mock("../ka-shared/index.js");

describe("#getSecrets", () => {
    describe("in production", () => {
        it("should lookup secrets with render-gateway crypto key path", () => {
            // Arrange
            jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue(
                "production",
            );
            const getGCloudSecretsSpy = jest.spyOn(
                KAShared,
                "getGCloudSecrets",
            );

            // Act
            getSecrets();

            // Assert
            expect(getGCloudSecretsSpy).toHaveBeenCalledWith({
                cryptoKeyPath:
                    "projects/khan-academy/locations/global/keyRings/secrets/cryptoKeys/render-gateway",
            });
        });
    });

    describe("not in production", () => {
        it("should lookup secrets with render-gateway root path", () => {
            // Arrange
            jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue(
                "development",
            );
            const getGCloudSecretsSpy = jest.spyOn(
                KAShared,
                "getGCloudSecrets",
            );

            // Act
            getSecrets();

            // Assert
            expect(getGCloudSecretsSpy).toHaveBeenCalledWith({
                serviceRootPath: "",
                lookupFn: expect.any(Function),
            });
        });

        it("should lookup secrets with lookupFn that returns null", async () => {
            // Arrange
            jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue(
                "development",
            );
            const getGCloudSecretsSpy = jest.spyOn(
                KAShared,
                "getGCloudSecrets",
            );
            getSecrets();
            const lookupFn = getGCloudSecretsSpy.mock.calls[0][0].lookupFn;

            // Act
            const result = lookupFn();

            // Assert
            expect(result).toBeNull();
        });
    });
});
