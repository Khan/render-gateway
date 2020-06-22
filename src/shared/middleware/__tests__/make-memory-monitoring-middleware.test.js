// @flow
import * as Shutdown from "../../shutdown.js";
import {makeMemoryMonitoringMiddleware} from "../make-memory-monitoring-middleware.js";

jest.mock("../../shutdown.js");

describe("#makeMemoryMonitoringMiddleware", () => {
    const {GAE_MEMORY_MB, MIN_FREE_MB} = process.env;
    const restoreEnvVar: (name: string, value: ?string) => void = (
        name,
        value,
    ) => {
        if (value == null) {
            delete process.env[name];
        } else {
            process.env[name] = value;
        }
    };

    afterEach(() => {
        restoreEnvVar("GAE_MEMORY_MB", GAE_MEMORY_MB);
        restoreEnvVar("MIN_FREE_MB", MIN_FREE_MB);
    });

    describe("missing env vars", () => {
        it("should log if GAE_MEMORY_MB env var is missing", async () => {
            // Arrange
            const fakeLogger: any = {
                info: jest.fn(),
                warn: jest.fn(),
            };
            delete process.env.GAE_MEMORY_MB;
            process.env.MIN_FREE_MB = "42";

            // Act
            makeMemoryMonitoringMiddleware(fakeLogger);

            // Assert
            expect(fakeLogger.info).toHaveBeenCalledWith(
                "Memory monitoring disabled. Required environment variables unavailable.",
            );
        });

        it("should log if MIN_FREE_MB env var is missing", async () => {
            // Arrange
            const fakeLogger: any = {
                info: jest.fn(),
                warn: jest.fn(),
            };
            delete process.env.MIN_FREE_MB;
            process.env.GAE_MEMORY_MB = "42";

            // Act
            makeMemoryMonitoringMiddleware(fakeLogger);

            // Assert
            expect(fakeLogger.info).toHaveBeenCalledWith(
                "Memory monitoring disabled. Required environment variables unavailable.",
            );
        });

        it("should return null if environmant variables are missing", async () => {
            // Arrange
            const fakeLogger: any = {
                info: jest.fn(),
                warn: jest.fn(),
            };
            delete process.env.MIN_FREE_MB;
            delete process.env.GAE_MEMORY_MB;

            // Act
            const middleware = makeMemoryMonitoringMiddleware(fakeLogger);

            // Assert
            expect(middleware).toBeNull();
        });
    });

    describe("env vars present", () => {
        it("should log the memory management environment variables used", () => {
            // Arrange
            process.env.GAE_MEMORY_MB = "99";
            process.env.MIN_FREE_MB = "42";
            const fakeLogger: any = {
                info: jest.fn(),
            };

            // Act
            makeMemoryMonitoringMiddleware(fakeLogger);

            // Assert
            expect(fakeLogger.info).toHaveBeenCalledWith(
                "Creating memory monitoring middleware",
                {
                    GAE_MEMORY_MB: "99",
                    MIN_FREE_MB: "42",
                },
            );
        });

        it("should return a middleware function", () => {
            // Arrange
            process.env.GAE_MEMORY_MB = "99";
            process.env.MIN_FREE_MB = "42";
            const fakeLogger: any = {
                info: jest.fn(),
            };

            // Act
            const result = makeMemoryMonitoringMiddleware(fakeLogger);

            // Assert
            expect(result).toBeFunction();
        });

        describe("creates middleware that", () => {
            describe("memory usage within bounds", () => {
                it("should log memory usage", async () => {
                    // Arrange
                    const fakeLogger: any = {
                        info: jest.fn(),
                        warn: jest.fn(),
                    };
                    process.env.MIN_FREE_MB = "300";
                    process.env.GAE_MEMORY_MB = "1024";
                    jest.spyOn(process, "memoryUsage").mockReturnValue({
                        rss: 200 * 1024 * 1024,
                    });
                    const middleware = makeMemoryMonitoringMiddleware(
                        fakeLogger,
                    );
                    const resSpy: any = {
                        set: jest.fn(),
                    };

                    // Act
                    // $FlowIgnore[incompatible-call] We know this is OK.
                    // $FlowIgnore[not-a-function] We know this is OK.
                    await middleware(({}: any), resSpy, jest.fn());

                    // Assert
                    expect(fakeLogger.info).toHaveBeenCalledWith(
                        "Memory usage is within bounds.",
                        {
                            totalUsageBytes: 200 * 1024 * 1024,
                            maxAllowedBytes:
                                1024 * 1024 * 1024 - 300 * 1024 * 1024,
                        },
                    );
                });

                it("should call next()", async () => {
                    // Arrange
                    const fakeLogger: any = {
                        info: jest.fn(),
                        warn: jest.fn(),
                    };
                    const nextFn = jest.fn();
                    process.env.MIN_FREE_MB = "100";
                    process.env.GAE_MEMORY_MB = "1024";
                    jest.spyOn(process, "memoryUsage").mockReturnValue({
                        rss: 200 * 1024 * 1024,
                    });
                    const middleware = makeMemoryMonitoringMiddleware(
                        fakeLogger,
                    );
                    const resSpy: any = {
                        set: jest.fn(),
                    };

                    // Act
                    // $FlowIgnore[incompatible-call] We know this is OK.
                    // $FlowIgnore[not-a-function] We know this is OK.
                    await middleware(({}: any), resSpy, nextFn);

                    // Assert
                    expect(nextFn).toHaveBeenCalledTimes(1);
                });
            });

            describe("memory usage exceeding bounds", () => {
                it("should log memory usage warning", async () => {
                    // Arrange
                    const fakeLogger: any = {
                        info: jest.fn(),
                        warn: jest.fn(),
                    };
                    process.env.MIN_FREE_MB = "300";
                    process.env.GAE_MEMORY_MB = "1024";
                    jest.spyOn(process, "memoryUsage").mockReturnValue({
                        rss: 800 * 1024 * 1024,
                    });
                    jest.spyOn(Shutdown, "shutdownGateway").mockResolvedValue();
                    const middleware = makeMemoryMonitoringMiddleware(
                        fakeLogger,
                    );
                    const resSpy: any = {
                        set: jest.fn(),
                    };

                    // Act
                    // $FlowIgnore[incompatible-call] We know this is OK.
                    // $FlowIgnore[not-a-function] We know this is OK.
                    await middleware(({}: any), resSpy, jest.fn());

                    // Assert
                    expect(fakeLogger.warn).toHaveBeenCalledWith(
                        "Memory usage is exceeding maximum.",
                        {
                            totalUsageBytes: 800 * 1024 * 1024,
                            maxAllowedBytes:
                                1024 * 1024 * 1024 - 300 * 1024 * 1024,
                        },
                    );
                });

                it("should shutdown gateway", async () => {
                    // Arrange
                    const fakeLogger: any = {
                        info: jest.fn(),
                        warn: jest.fn(),
                    };
                    process.env.MIN_FREE_MB = "300";
                    process.env.GAE_MEMORY_MB = "1024";
                    jest.spyOn(process, "memoryUsage").mockReturnValue({
                        rss: 800 * 1024 * 1024,
                    });
                    const shutdownSpy = jest
                        .spyOn(Shutdown, "shutdownGateway")
                        .mockResolvedValue();
                    const middleware = makeMemoryMonitoringMiddleware(
                        fakeLogger,
                    );
                    const resSpy: any = {
                        set: jest.fn(),
                    };

                    // Act
                    // $FlowIgnore[incompatible-call] We know this is OK.
                    // $FlowIgnore[not-a-function] We know this is OK.
                    await middleware(({}: any), resSpy, jest.fn());

                    // Assert
                    expect(shutdownSpy).toHaveBeenCalledWith(fakeLogger);
                });

                it("should call next()", async () => {
                    // Arrange
                    const fakeLogger: any = {
                        info: jest.fn(),
                        warn: jest.fn(),
                    };
                    const nextFn = jest.fn();
                    process.env.MIN_FREE_MB = "300";
                    process.env.GAE_MEMORY_MB = "1024";
                    jest.spyOn(process, "memoryUsage").mockReturnValue({
                        rss: 800 * 1024 * 1024,
                    });
                    jest.spyOn(Shutdown, "shutdownGateway").mockResolvedValue();
                    const middleware = makeMemoryMonitoringMiddleware(
                        fakeLogger,
                    );
                    const resSpy: any = {
                        set: jest.fn(),
                    };

                    // Act
                    // $FlowIgnore[incompatible-call] We know this is OK.
                    // $FlowIgnore[not-a-function] We know this is OK.
                    await middleware(({}: any), resSpy, nextFn);

                    // Assert
                    expect(nextFn).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});
