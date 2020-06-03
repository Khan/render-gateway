// @flow
import * as KAShared from "../../../ka-shared/index.js";
import * as GetSecrets from "../../get-secrets.js";
import {makeCheckSecretMiddleware} from "../make-check-secret-middleware.js";

jest.mock("../../../ka-shared/index.js");
jest.mock("../../get-secrets.js");

describe("#makeCheckSecretMiddleware", () => {
    describe("without authentication options", () => {
        it("should create noop middleware", async () => {
            // Arrange
            const fakeNext = jest.fn();
            const fakeLogger = {
                info: jest.fn(),
            };
            const result: Function = await makeCheckSecretMiddleware();
            jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);

            // Act
            result(null, null, fakeNext);

            // Assert
            expect(fakeNext).toHaveBeenCalledTimes(1);
        });

        it("should log that authentication is omitted", async () => {
            // Arrange
            const fakeNext = jest.fn();
            const fakeLogger = {
                info: jest.fn(),
            };
            const result: Function = await makeCheckSecretMiddleware();
            jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);

            // Act
            result(null, null, fakeNext);

            // Assert
            expect(fakeLogger.info).toHaveBeenCalledTimes(1);
            expect(fakeLogger.info.mock.calls[0][0]).toMatchInlineSnapshot(
                `"Authentication is not configured for this service."`,
            );
        });
    });

    describe("when not in production", () => {
        it("should create noop middleware", async () => {
            // Arrange
            const fakeAuthOptions = ({}: any);
            const fakeNext = jest.fn();
            jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue(
                "development",
            );
            const fakeRequest = {
                header: () => "SECRET_VALUE",
                headers: [],
            };
            const fakeLogger = {
                debug: jest.fn(),
            };
            const result: Function = await makeCheckSecretMiddleware(
                fakeAuthOptions,
            );
            jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);

            // Act
            result(fakeRequest, null, fakeNext);

            // Assert
            expect(fakeNext).toHaveBeenCalledTimes(1);
        });

        it("should log if authentication header is omitted from request", async () => {
            // Arrange
            const fakeAuthOptions = ({
                headerName: "SECRET_HEADER",
            }: any);
            const fakeNext = jest.fn();
            jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue(
                "development",
            );
            const fakeRequest = {
                header: () => null,
                headers: [],
            };
            const fakeLogger = {
                warn: jest.fn(),
            };
            const result: Function = await makeCheckSecretMiddleware(
                fakeAuthOptions,
            );
            jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);

            // Act
            result(fakeRequest, null, fakeNext);

            // Assert
            expect(fakeLogger.warn).toHaveBeenCalledTimes(1);
            expect(fakeLogger.warn.mock.calls[0][0]).toMatchInlineSnapshot(
                `"Authentication header was not included in request."`,
            );
        });

        it("should log when authentication header is present but ignored", async () => {
            // Arrange
            const fakeAuthOptions = ({
                headerName: "SECRET_HEADER",
            }: any);
            const fakeNext = jest.fn();
            jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue(
                "development",
            );
            const fakeRequest = {
                header: () => "SECRET_VALUE",
                headers: [],
            };
            const fakeLogger = {
                debug: jest.fn(),
            };
            const result: Function = await makeCheckSecretMiddleware(
                fakeAuthOptions,
            );
            jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);

            // Act
            result(fakeRequest, null, fakeNext);

            // Assert
            expect(fakeLogger.debug).toHaveBeenCalledTimes(1);
            expect(fakeLogger.debug.mock.calls[0][0]).toMatchInlineSnapshot(
                `"Authentication header present but ignored in current runtime mode"`,
            );
        });

        it("should delete header when present", async () => {
            // Arrange
            const fakeAuthOptions = ({
                headerName: "SECRET_HEADER",
            }: any);
            const fakeNext = jest.fn();
            jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue(
                "development",
            );
            const fakeRequest = {
                header: () => "SECRET_VALUE",
                headers: {
                    SECRET_HEADER: "SECRET_VALUE",
                },
            };
            const fakeLogger = {
                debug: jest.fn(),
            };
            const result: Function = await makeCheckSecretMiddleware(
                fakeAuthOptions,
            );
            jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);

            // Act
            result(fakeRequest, null, fakeNext);

            // Assert
            expect(fakeRequest.headers).not.toHaveProperty("SECRET_HEADER");
        });
    });

    describe("when in production", () => {
        beforeEach(() => {
            jest.spyOn(KAShared, "getRuntimeMode").mockReturnValue(
                "production",
            );
        });

        it("should load secrets", async () => {
            // Arrange
            const authenticationOptions = {
                cryptoKeyPath: "CRYPTO_KEY_PATH",
                secretKey: "SECRET_KEY",
                headerName: "HEADER_NAME",
            };
            const fakeSecrets = {
                SECRET_KEY: "SECRET_VALUE",
            };
            const getSecretsSpy = jest
                .spyOn(GetSecrets, "getSecrets")
                .mockReturnValue(fakeSecrets);

            // Act
            await makeCheckSecretMiddleware(authenticationOptions);

            // Assert
            expect(getSecretsSpy).toHaveBeenCalledWith("CRYPTO_KEY_PATH");
        });

        it("should throw if secret key is not in secrets", async () => {
            // Arrange
            const authenticationOptions = {
                cryptoKeyPath: "CRYPTO_KEY_PATH",
                secretKey: "MISSING_SECRET_KEY",
                headerName: "HEADER_NAME",
            };
            const fakeSecrets = {
                SECRET_KEY: "SECRET_VALUE",
            };
            jest.spyOn(GetSecrets, "getSecrets").mockReturnValue(fakeSecrets);

            // Act
            const underTest = makeCheckSecretMiddleware(authenticationOptions);

            // Assert
            await expect(underTest).rejects.toThrowErrorMatchingInlineSnapshot(
                `"Unable to load secret"`,
            );
        });

        describe("middleware", () => {
            beforeEach(() => {
                jest.spyOn(GetSecrets, "getSecrets").mockReturnValue({
                    SECRET_KEY: "SECRET_VALUE",
                });
            });

            describe("upon request with valid secret", () => {
                it("should continue", async () => {
                    // Arrange
                    const fakeRequest = {
                        header: () => "SECRET_VALUE",
                        headers: [],
                    };
                    const fakeNext = jest.fn();
                    const authenticationOptions = {
                        cryptoKeyPath: "CRYPTO_KEY_PATH",
                        secretKey: "SECRET_KEY",
                        headerName: "HEADER_NAME",
                    };
                    const middleware: Function = await makeCheckSecretMiddleware(
                        authenticationOptions,
                    );

                    // Act
                    middleware(fakeRequest, null, fakeNext);

                    // Assert
                    expect(fakeNext).toHaveBeenCalledTimes(1);
                });

                it("should delete the auth header", async () => {
                    // Arrange
                    const fakeRequest = {
                        header: () => "SECRET_VALUE",
                        headers: {
                            header_name: "SECRET_VALUE",
                        },
                    };
                    const fakeNext = jest.fn();
                    const authenticationOptions = {
                        cryptoKeyPath: "CRYPTO_KEY_PATH",
                        secretKey: "SECRET_KEY",
                        headerName: "HEADER_NAME",
                    };
                    const middleware: Function = await makeCheckSecretMiddleware(
                        authenticationOptions,
                    );

                    // Act
                    middleware(fakeRequest, null, fakeNext);

                    // Assert
                    expect(fakeRequest.headers).not.toHaveProperty(
                        "header_name",
                    );
                });
            });

            describe("upon request with invalid secret header value", () => {
                it("should respond with 401 (Not Authorized) status", async () => {
                    // Arrange
                    const fakeRequest = {
                        header: () => "WRONG_SECRET_VALUE",
                        headers: [],
                    };
                    const fakeResponse = {
                        status: jest.fn().mockReturnThis(),
                        send: jest.fn().mockReturnThis(),
                    };
                    const authenticationOptions = {
                        cryptoKeyPath: "CRYPTO_KEY_PATH",
                        secretKey: "SECRET_KEY",
                        headerName: "HEADER_NAME",
                    };
                    const middleware: Function = await makeCheckSecretMiddleware(
                        authenticationOptions,
                    );

                    // Act
                    middleware(fakeRequest, fakeResponse, null);

                    // Assert
                    expect(fakeResponse.status).toHaveBeenCalledWith(401);
                });

                it("should respond with error message", async () => {
                    // Arrange
                    const fakeRequest = {
                        header: () => "WRONG_SECRET_VALUE",
                        headers: [],
                    };
                    const fakeResponse = {
                        status: jest.fn().mockReturnThis(),
                        send: jest.fn().mockReturnThis(),
                    };
                    const authenticationOptions = {
                        cryptoKeyPath: "CRYPTO_KEY_PATH",
                        secretKey: "SECRET_KEY",
                        headerName: "HEADER_NAME",
                    };
                    const middleware: Function = await makeCheckSecretMiddleware(
                        authenticationOptions,
                    );

                    // Act
                    middleware(fakeRequest, fakeResponse, null);

                    // Assert
                    expect(fakeResponse.send).toHaveBeenCalledWith(
                        expect.objectContaining({
                            error: expect.any(String),
                        }),
                    );
                    expect(
                        fakeResponse.send.mock.calls[0][0].error,
                    ).toMatchInlineSnapshot(`"Missing or invalid secret"`);
                });
            });

            describe("upon request with missing secret header", () => {
                it("should respond with 401 (Not Authorized) status", async () => {
                    // Arrange
                    const fakeRequest = {
                        header: () => undefined,
                        headers: [],
                    };
                    const fakeResponse = {
                        status: jest.fn().mockReturnThis(),
                        send: jest.fn().mockReturnThis(),
                    };
                    const authenticationOptions = {
                        cryptoKeyPath: "CRYPTO_KEY_PATH",
                        secretKey: "SECRET_KEY",
                        headerName: "HEADER_NAME",
                    };
                    const middleware: Function = await makeCheckSecretMiddleware(
                        authenticationOptions,
                    );

                    // Act
                    middleware(fakeRequest, fakeResponse, null);

                    // Assert
                    expect(fakeResponse.status).toHaveBeenCalledWith(401);
                });

                it("should respond with error message", async () => {
                    // Arrange
                    const fakeRequest = {
                        header: () => undefined,
                        headers: [],
                    };
                    const fakeResponse = {
                        status: jest.fn().mockReturnThis(),
                        send: jest.fn().mockReturnThis(),
                    };
                    const authenticationOptions = {
                        cryptoKeyPath: "CRYPTO_KEY_PATH",
                        secretKey: "SECRET_KEY",
                        headerName: "HEADER_NAME",
                    };
                    const middleware: Function = await makeCheckSecretMiddleware(
                        authenticationOptions,
                    );

                    // Act
                    middleware(fakeRequest, fakeResponse, null);

                    // Assert
                    expect(fakeResponse.send).toHaveBeenCalledWith(
                        expect.objectContaining({
                            error: expect.any(String),
                        }),
                    );
                    expect(
                        fakeResponse.send.mock.calls[0][0].error,
                    ).toMatchInlineSnapshot(`"Missing or invalid secret"`);
                });
            });
        });
    });
});
