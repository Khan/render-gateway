// @flow
import {getRequestAuthentication} from "../get-request-authentication.js";
import type {AuthenticationOptions} from "../types.js";
import * as GetSecrets from "../get-secrets.js";

jest.mock("../get-secrets.js");

describe("#getRequestAuthentication", () => {
    it("should resolve to undefined if there are no authentication options", async () => {
        // Arrange

        // Act
        const result = await getRequestAuthentication(undefined);

        // Assert
        expect(result).toBeUndefined();
    });

    it("should get the secrets for the given crypto key path", async () => {
        // Arrange
        const authentication: AuthenticationOptions = {
            cryptoKeyPath: "some/path",
            headerName: "some-header",
            secretKey: "some-secret",
        };
        const getSecretsSpy = jest
            .spyOn(GetSecrets, "getSecrets")
            .mockResolvedValue({
                "some-secret": "some-secret-value",
            });

        // Act
        await getRequestAuthentication(authentication);

        // Assert
        expect(getSecretsSpy).toHaveBeenCalledWith("some/path");
    });

    it("should throw an error if the secret key is not found in the retrieved secrets", async () => {
        // Arrange
        const authentication: AuthenticationOptions = {
            cryptoKeyPath: "some/path",
            headerName: "some-header",
            secretKey: "some-secret",
        };
        jest.spyOn(GetSecrets, "getSecrets").mockResolvedValue({});

        // Act
        const underTest = getRequestAuthentication(authentication);

        // Assert
        await expect(underTest).rejects.toThrowErrorMatchingInlineSnapshot(
            `"Unable to load secret"`,
        );
    });

    it("should return the authentication data with the deprecrated secret as the secret if the deprecated secret is not provided", async () => {
        // Arrange
        const authentication: AuthenticationOptions = {
            cryptoKeyPath: "some/path",
            headerName: "some-header",
            secretKey: "some-secret",
        };
        jest.spyOn(GetSecrets, "getSecrets").mockResolvedValue({
            "some-secret": "some-secret-value",
        });

        // Act
        const result = await getRequestAuthentication(authentication);

        // Assert
        expect(result).toStrictEqual({
            headerName: "some-header",
            secret: "some-secret-value",
            deprecatedSecret: "some-secret-value",
        });
    });

    it("should return the authentication data with the deprecated secret as the secret if the deprecated secret key is not found", async () => {
        // Arrange
        const authentication: AuthenticationOptions = {
            cryptoKeyPath: "some/path",
            headerName: "some-header",
            secretKey: "some-secret",
            deprecatedSecretKey: "some-deprecated-secret",
        };
        jest.spyOn(GetSecrets, "getSecrets").mockResolvedValue({
            "some-secret": "some-secret-value",
        });

        // Act
        const result = await getRequestAuthentication(authentication);

        // Assert
        expect(result).toStrictEqual({
            headerName: "some-header",
            secret: "some-secret-value",
            deprecatedSecret: "some-secret-value",
        });
    });

    it("should return the authentication data including both the secret and deprecated secret when both are provided", async () => {
        // Arrange
        const authentication: AuthenticationOptions = {
            cryptoKeyPath: "some/path",
            headerName: "some-header",
            secretKey: "some-secret",
            deprecatedSecretKey: "some-deprecated-secret",
        };
        jest.spyOn(GetSecrets, "getSecrets").mockResolvedValue({
            "some-secret": "some-secret-value",
            "some-deprecated-secret": "some-deprecated-secret-value",
        });

        // Act
        const result = await getRequestAuthentication(authentication);

        // Assert
        expect(result).toStrictEqual({
            headerName: "some-header",
            secret: "some-secret-value",
            deprecatedSecret: "some-deprecated-secret-value",
        });
    });
});
