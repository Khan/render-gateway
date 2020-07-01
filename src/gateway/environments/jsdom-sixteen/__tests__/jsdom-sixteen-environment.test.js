// @flow
import vm from "vm";
import * as JSDOM from "jsdom16";
import * as CreateVirtualConsole from "../create-virtual-console.js";
import * as PatchAgainstDanglingTimers from "../../shared/patch-against-dangling-timers.js";
import {JSDOMSixteenEnvironment} from "../jsdom-sixteen-environment.js";

jest.mock("jsdom16");
jest.mock("../create-virtual-console.js");
jest.mock("../../shared/patch-against-dangling-timers.js");

describe("JSDOMSixteenEnvironment", () => {
    beforeEach(() => {
        jest.useRealTimers();
    });

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
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest.fn(),
                afterEnvSetup: jest.fn(),
            };
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e) {
                /**
                 * We care about the expectation below.
                 */
            }

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
            const fakeLoader: any = {
                fetch: jest.fn(),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest.fn().mockReturnValue(fakeLoader),
                afterEnvSetup: jest.fn(),
            };
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(fakeConfiguration.getFileList).toHaveBeenCalledWith(
                "URL",
                fakeRenderAPI,
                expect.any(Function),
            );
        });

        it("should use the resource loader for getFileList fetching", async () => {
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
            const fakeLoader: any = {
                fetch: jest.fn(),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest.fn().mockReturnValue(fakeLoader),
                afterEnvSetup: jest.fn(),
            };
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Act
            const fetchFn = fakeConfiguration.getFileList.mock.calls[0][2];
            fetchFn("SOME_URL", "OPTIONS");

            // Assert
            expect(fakeLoader.fetch).toHaveBeenCalledWith(
                "SOME_URL",
                "OPTIONS",
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
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest.fn(),
                afterEnvSetup: jest.fn(),
            };
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e) {
                /**
                 * We care about the expectation below.
                 */
            }

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
                registrationCallbackName: "__register__",
                getFileList: jest
                    .fn()
                    .mockResolvedValue(["filea", "fileb", "filec"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e) {
                /**
                 * We care about the expectation below.
                 */
            }

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
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["BAD_FILE"]),
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
                fetch: jest.fn().mockResolvedValue(null),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["BAD_FILE"]),
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
                registrationCallbackName: "__register__",
                getFileList: jest
                    .fn()
                    .mockResolvedValue(["filea", "fileb", "filec"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            const env = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            try {
                await env.render("URL", fakeRenderAPI);
            } catch (e) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(fakeTraceSession.end).toHaveBeenCalled();
        });

        it("should create JSDOM instance for render location", async () => {
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
            const fakeResourceLoader: any = {};
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const jsdomSpy = jest.spyOn(JSDOM, "JSDOM");
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(jsdomSpy).toHaveBeenCalledWith(
                "<!DOCTYPE html><html><head></head><body></body></html>",
                {
                    url: "URL",
                    runScripts: "dangerously",
                    resources: fakeResourceLoader,
                    pretendToBeVisual: true,
                    virtualConsole: "FAKE_CONSOLE",
                },
            );
        });

        it("should close JSDOM window on rejection", async () => {
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
            const fakeResourceLoader: any = {};
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow = {
                close: jest.fn(),
            };
            const fakeJSDOM = {
                window: fakeWindow,
                getInternalVMContext: jest.fn().mockReturnValue(fakeWindow),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            const underTest = environment.render("URL", fakeRenderAPI);

            // Assert
            await expect(underTest).rejects.toThrowError();
            expect(fakeJSDOM.window.close).toHaveBeenCalled();
        });

        it("should patch the JSDOM instance against dangling timers", async () => {
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
            const fakeResourceLoader: any = {};
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const patchSpy = jest.spyOn(
                PatchAgainstDanglingTimers,
                "patchAgainstDanglingTimers",
            );
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(patchSpy).toHaveBeenCalledWith(fakeWindow);
        });

        it("should close the dangling timer gate on rejection", async () => {
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
            const fakeResourceLoader: any = {};
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const fakeGate = {
                close: jest.fn(),
            };
            jest.spyOn(
                PatchAgainstDanglingTimers,
                "patchAgainstDanglingTimers",
            ).mockReturnValue(fakeGate);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            const underTest = environment.render("URL", fakeRenderAPI);

            // Assert
            await expect(underTest).rejects.toThrowError();
            expect(fakeGate.close).toHaveBeenCalled();
        });

        it("should call afterEnvSetup", async () => {
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
                fetch: jest.fn().mockResolvedValue(Buffer.from("CONTENT")),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["A", "B", "C"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const underTest = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(fakeConfiguration.afterEnvSetup).toHaveBeenCalledWith(
                "URL",
                ["A", "B", "C"],
                fakeRenderAPI,
                fakeJSDOM.window,
            );
        });

        it("should invoke the closeable returned by afterEnvSetup on rejection", async () => {
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
            const fakeResourceLoader: any = {};
            const afterEnvCloseable = {
                close: jest.fn(),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn().mockResolvedValue(afterEnvCloseable),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            const underTest = environment.render("URL", fakeRenderAPI);

            // Assert
            await expect(underTest).rejects.toThrowError();
            expect(afterEnvCloseable.close).toHaveBeenCalled();
        });

        it("should execute the downloaded files in order in the JSDOM VM context", async () => {
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
                fetch: jest.fn().mockImplementation((f) => {
                    switch (f) {
                        case "filea":
                            return Promise.resolve(`window["gubbins"] = 42;`);

                        case "fileb":
                            return Promise.resolve(
                                `window["gubbins"] = 2 * window["gubbins"];`,
                            );
                    }
                    throw new Error(`Unexpected file: ${f}`);
                }),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea", "fileb"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            try {
                await environment.render("URL", fakeRenderAPI);
            } catch (e) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(fakeWindow).toMatchObject({
                gubbins: 84,
            });
        });

        it("should throw if no callback is registered", async () => {
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
                fetch: jest.fn().mockImplementation((f) => {
                    switch (f) {
                        case "filea":
                            return Promise.resolve(`window["gubbins"] = 42;`);

                        case "fileb":
                            return Promise.resolve(
                                `window["gubbins"] = 2 * window["gubbins"];`,
                            );
                    }
                    throw new Error(`Unexpected file: ${f}`);
                }),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea", "fileb"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            const underTest = environment.render("URL", fakeRenderAPI);

            // Assert
            await expect(underTest).rejects.toThrowErrorMatchingInlineSnapshot(
                `"No render callback was registered."`,
            );
        });

        it("should invoke the registered render method and return the result", async () => {
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
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            const result = await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(result).toEqual({
                body: "THIS IS A RENDER!",
                status: 200,
                headers: {},
            });
        });

        it("should close JSDOM window on success", async () => {
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
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow: any = {
                close: jest.fn(),
            };
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeWindow.close).toHaveBeenCalled();
        });

        it("should close the dangling timer gate on success", async () => {
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
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow: any = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const fakeGate = {
                close: jest.fn(),
            };
            jest.spyOn(
                PatchAgainstDanglingTimers,
                "patchAgainstDanglingTimers",
            ).mockReturnValue(fakeGate);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeGate.close).toHaveBeenCalled();
        });

        it("should invoke the closeable returned by afterEnvSetup on success", async () => {
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
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
            };
            const afterEnvCloseable = {
                close: jest.fn(),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn().mockResolvedValue(afterEnvCloseable),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow: any = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(afterEnvCloseable.close).toHaveBeenCalled();
        });

        it("should log closeable errors", async () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
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
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
            };
            const afterEnvCloseable = {
                close: () => {
                    throw new Error("AFTER ENV GO BOOM ON CLOSE!");
                },
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn().mockResolvedValue(afterEnvCloseable),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow: any = {
                close: jest.fn(),
            };
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const fakeGate = {
                close: jest.fn(),
            };
            jest.spyOn(
                PatchAgainstDanglingTimers,
                "patchAgainstDanglingTimers",
            ).mockReturnValue(fakeGate);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeLogger.error).toHaveBeenCalledWith(
                "Closeable encountered an error: Error: AFTER ENV GO BOOM ON CLOSE!",
                expect.any(Object),
            );
        });

        it("should close all non-erroring closeables", async () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
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
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
                close: jest.fn(),
            };
            const afterEnvCloseable = {
                close: () => {
                    throw new Error("AFTER ENV GO BOOM ON CLOSE!");
                },
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn().mockResolvedValue(afterEnvCloseable),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow: any = {
                close: jest.fn(),
            };
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const fakeGate = {
                close: jest.fn(),
            };
            jest.spyOn(
                PatchAgainstDanglingTimers,
                "patchAgainstDanglingTimers",
            ).mockReturnValue(fakeGate);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeWindow.close).toHaveBeenCalled();
            expect(fakeGate.close).toHaveBeenCalled();
            expect(fakeResourceLoader.close).toHaveBeenCalled();
        });

        it.each([
            undefined,
            null,
            "THIS IS NOT CORRECT",
            {status: 200, headers: {}},
            {body: "NEED MORE THAN THIS"},
            {body: "THIS HELPS BUT WHERE ARE THE HEADERS", status: 200},
        ])("should reject if result is malformed", async (testResult) => {
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
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return ${JSON.stringify(testResult)};
}

window["__register__"](fakeRender);
`),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            };
            jest.spyOn(
                CreateVirtualConsole,
                "createVirtualConsole",
            ).mockReturnValue("FAKE_CONSOLE");
            const fakeWindow = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function () {
                    return this.window;
                }),
            };
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMSixteenEnvironment(fakeConfiguration);

            // Act
            const underTest = environment.render("URL", fakeRenderAPI);

            // Assert
            await expect(underTest).rejects.toThrowErrorMatchingSnapshot();
        });
    });
});
