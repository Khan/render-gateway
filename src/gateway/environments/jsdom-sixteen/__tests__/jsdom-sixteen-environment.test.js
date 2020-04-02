// @flow
import {JSDOMSixteenEnvironment} from "../jsdom-sixteen-environment.js";

describe("JSDOMSixteenEnvironment", () => {
    describe("#constructor", () => {
        it("should throw if configuration is not provided", () => {
            // Arrange

            // Act
            const underTest = () => new JSDOMSixteenEnvironment((null: any));

            // Assert
            expect(underTest).toThrowErrorMatchingInlineSnapshot(
                `"Must provide environment configuration"`,
            );
        });
    });

    describe("#render", () => {
        it("should get a resource loader", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                getHeader: jest.fn(),
                logger: fakeLogger,
            };
            const fakeConfiguration = {
                getFileList: jest.fn().mockReturnValue(Promise.resolve([])),
                getResourceLoader: jest.fn(),
                afterEnvSetup: jest.fn(),
            };
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            await underTest.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeConfiguration.getResourceLoader).toHaveBeenCalledWith(
                "URL",
                fakeRenderAPI,
            );
        });

        it("should retrieve the list of files to be downloaded", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                getHeader: jest.fn(),
                logger: fakeLogger,
            };
            const fakeConfiguration = {
                getFileList: jest.fn().mockReturnValue(Promise.resolve([])),
                getResourceLoader: jest.fn(),
                afterEnvSetup: jest.fn(),
            };
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            await underTest.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeConfiguration.getFileList).toHaveBeenCalledWith(
                "URL",
                fakeRenderAPI,
            );
        });

        it("should trace the file acquisition phase", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                getHeader: jest.fn(),
                logger: fakeLogger,
            };
            const fakeConfiguration = {
                getFileList: jest.fn().mockReturnValue(Promise.resolve([])),
                getResourceLoader: jest.fn(),
                afterEnvSetup: jest.fn(),
            };
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            await underTest.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeRenderAPI.trace).toHaveBeenCalledBefore(
                fakeConfiguration.getFileList,
            );
        });

        it("should fetch the files via the resource loader", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                getHeader: jest.fn(),
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest
                    .fn()
                    .mockImplementation((f) =>
                        Promise.resolve(`FETCHED: ${f}`),
                    ),
            };
            const fakeConfiguration = {
                getFileList: jest
                    .fn()
                    .mockReturnValue(
                        Promise.resolve(["filea", "fileb", "filec"]),
                    ),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            await underTest.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeResourceLoader.fetch).toHaveBeenCalledWith("filea");
            expect(fakeResourceLoader.fetch).toHaveBeenCalledWith("fileb");
            expect(fakeResourceLoader.fetch).toHaveBeenCalledWith("filec");
        });

        it("should throw if file fetch returns null", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                getHeader: jest.fn(),
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockReturnValue(null),
            };
            const fakeConfiguration = {
                getFileList: jest
                    .fn()
                    .mockReturnValue(Promise.resolve(["BAD_FILE"])),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            const env = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            const underTest = env.render("URL", fakeRenderAPI);

            // Assert
            await expect(underTest).rejects.toThrowErrorMatchingInlineSnapshot(
                `"Unable to retrieve BAD_FILE. ResourceLoader returned null."`,
            );
        });

        it("should end the trace session if file acquisition throws", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                getHeader: jest.fn(),
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockReturnValue(Promise.resolve(null)),
            };
            const fakeConfiguration = {
                getFileList: jest
                    .fn()
                    .mockReturnValue(Promise.resolve(["BAD_FILE"])),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            const env = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            await env.render("URL", fakeRenderAPI).catch(() => {
                /* NOTHING */
            });

            // Assert
            expect(fakeTraceSession.end).toHaveBeenCalled();
        });

        it("should end the trace session if file acquisition succeeds", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                getHeader: jest.fn(),
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest
                    .fn()
                    .mockImplementation((f) =>
                        Promise.resolve(`FETCHED: ${f}`),
                    ),
            };
            const fakeConfiguration = {
                getFileList: jest
                    .fn()
                    .mockReturnValue(
                        Promise.resolve(["filea", "fileb", "filec"]),
                    ),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            const env = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            await env.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeTraceSession.end).toHaveBeenCalled();
        });

        it.todo("should setup the JSDOM VM environment");

        it.todo("should apply afterEnvSetup");

        it.todo("should invoke the render");

        it.todo("should return the render result");
    });
});
