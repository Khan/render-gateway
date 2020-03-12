// @flow
import * as SuperagentCachePlugin from "superagent-cache-plugin";
import {
    FROM_CACHE_PROP_NAME,
    isFromCache,
    asCachedRequest,
    asUncachedRequest,
} from "../requests-from-cache.js";

jest.mock("superagent-cache-plugin");

describe("#isFromCache", () => {
    it("should return true if the response FROM_CACHE_PROP_NAME property is true", () => {
        // Arrange
        const fakeResponse: any = {};
        fakeResponse[FROM_CACHE_PROP_NAME] = true;

        // Act
        const result = isFromCache(fakeResponse);

        // Assert
        expect(result).toBeTrue();
    });

    it.each([false, "NO", undefined])(
        "should return false if the response FROM_CACHE_PROP_NAME property is %s",
        (testPoint) => {
            // Arrange
            const fakeResponse: any = {};
            fakeResponse[FROM_CACHE_PROP_NAME] = testPoint;

            // Act
            const result = isFromCache(fakeResponse);

            // Assert
            expect(result).toBeFalse();
        },
    );

    it("should return false if the response FROM_CACHE_PROP_NAME property missing", () => {
        // Arrange
        const fakeResponse: any = {};

        // Act
        const result = isFromCache(fakeResponse);

        // Assert
        expect(result).toBeFalse();
    });
});

describe("#asUncachedRequest", () => {
    it("should buffer according to the buffer argument", () => {
        // Arrange
        const fakeBufferArg: any = "BUFFERS";
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asUncachedRequest(fakeRequest, fakeBufferArg);

        // Assert
        expect(fakeRequest.buffer).toHaveBeenCalledWith(fakeBufferArg);
    });

    it("should resolve with the FROM_CACHE_PROP_NAME prop set to false", async () => {
        // Arrange
        const fakeResponse = {};
        const fakeRequest: any = Promise.resolve(fakeResponse);
        fakeRequest.buffer = jest.fn().mockReturnThis();

        // Act
        const result = await asUncachedRequest(fakeRequest, false);

        // Assert
        expect(result).toHaveProperty(FROM_CACHE_PROP_NAME, false);
    });
});

describe("#asCachedRequest", () => {
    it("should invoke superagent cache plugin with provider from strategy", () => {
        // Arrange
        const fakeBufferArg: any = "BUFFERS";
        const fakeCachingStrategy: any = {
            provider: "FAKE_PROVIDER",
        };
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };
        const superagentCacheSpy = jest.spyOn(SuperagentCachePlugin, "default");

        // Act
        asCachedRequest(fakeRequest, fakeCachingStrategy, fakeBufferArg);

        // Assert
        expect(superagentCacheSpy).toHaveBeenCalledWith(
            fakeCachingStrategy.provider,
        );
    });

    it("should use the superagent cache plugin instance", () => {
        // Arrange
        const fakeBufferArg: any = "BUFFERS";
        const fakeCachingStrategy: any = {};
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };
        jest.spyOn(SuperagentCachePlugin, "default").mockReturnValue(
            "FAKE_CACHE_PLUGIN",
        );

        // Act
        asCachedRequest(fakeRequest, fakeCachingStrategy, fakeBufferArg);

        // Assert
        expect(fakeRequest.use).toHaveBeenCalledWith("FAKE_CACHE_PLUGIN");
    });

    it("should set the cache expiration to undefined if no caching strategy for expiration", () => {
        // Arrange
        const fakeBufferArg: any = "BUFFERS";
        const fakeCachingStrategy: any = {
            getExpiration: null,
        };
        const fakeRequest: any = {
            url: "THE URL",
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeRequest, fakeCachingStrategy, fakeBufferArg);

        // Assert
        expect(fakeRequest.expiration).toHaveBeenCalledWith(undefined);
    });

    it("should get an expiration value based off the caching strategy", () => {
        // Arrange
        const fakeBufferArg: any = "BUFFERS";
        const fakeCachingStrategy: any = {
            getExpiration: jest.fn(),
        };
        const fakeRequest: any = {
            url: "THE URL",
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeRequest, fakeCachingStrategy, fakeBufferArg);

        // Assert
        expect(fakeCachingStrategy.getExpiration).toHaveBeenCalledWith(
            "THE URL",
        );
    });

    it("should set the cache expiration based off the caching strategy value", () => {
        // Arrange
        const fakeBufferArg: any = "BUFFERS";
        const fakeCachingStrategy: any = {
            getExpiration: jest.fn().mockReturnValue("EXPIRATION VALUE"),
        };
        const fakeRequest: any = {
            url: "THE URL",
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeRequest, fakeCachingStrategy, fakeBufferArg);

        // Assert
        expect(fakeRequest.expiration).toHaveBeenCalledWith("EXPIRATION VALUE");
    });

    it("should add a custom prune function to the request caching", () => {
        // Arrange
        const fakeBufferArg: any = "BUFFERS";
        const fakeCachingStrategy: any = {};
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeRequest, fakeCachingStrategy, fakeBufferArg);

        // Assert
        expect(fakeRequest.prune).toHaveBeenCalledWith(expect.any(Function));
    });

    describe("prune operation", () => {
        it("should gut the response with the passed function", () => {
            // Arrange
            const fakeBufferArg: any = "BUFFERS";
            const fakeCachingStrategy: any = {};
            const fakeRequest: any = {
                buffer: jest.fn().mockReturnThis(),
                expiration: jest.fn().mockReturnThis(),
                prune: jest.fn().mockReturnThis(),
                use: jest.fn().mockReturnThis(),
                then: jest.fn().mockReturnThis(),
            };
            const fakeResponse = "FAKE_RESPONSE";
            const gutResponseFn = jest.fn().mockReturnValue({});
            asCachedRequest(fakeRequest, fakeCachingStrategy, fakeBufferArg);
            const pruneFn = fakeRequest.prune.mock.calls[0][0];

            // Act
            pruneFn(fakeResponse, gutResponseFn);

            // Assert
            expect(gutResponseFn).toHaveBeenCalledWith(fakeResponse);
        });

        it("should initialize the FROM_CACHE_PROP_NAME property on the response to a non-boolean, non-falsy placeholder value", () => {
            // Arrange
            const fakeBufferArg: any = "BUFFERS";
            const fakeCachingStrategy: any = {};
            const fakeRequest: any = {
                buffer: jest.fn().mockReturnThis(),
                expiration: jest.fn().mockReturnThis(),
                prune: jest.fn().mockReturnThis(),
                use: jest.fn().mockReturnThis(),
                then: jest.fn().mockReturnThis(),
            };
            const fakeResponse = {};
            const gutResponseFn = jest.fn().mockReturnValue(fakeResponse);
            asCachedRequest(fakeRequest, fakeCachingStrategy, fakeBufferArg);
            const pruneFn = fakeRequest.prune.mock.calls[0][0];

            // Act
            pruneFn(fakeResponse, gutResponseFn);

            // Assert
            expect(fakeResponse).toHaveProperty(FROM_CACHE_PROP_NAME);
            expect(fakeResponse[FROM_CACHE_PROP_NAME]).not.toBeBoolean();
            expect(fakeResponse[FROM_CACHE_PROP_NAME]).not.toBeFalsy();
        });
    });

    it("should buffer according to the buffer argument", () => {
        // Arrange
        const fakeBufferArg: any = "BUFFERS";
        const fakeCachingStrategy: any = {};
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeRequest, fakeCachingStrategy, fakeBufferArg);

        // Assert
        expect(fakeRequest.buffer).toHaveBeenCalledWith(fakeBufferArg);
    });

    describe("when the request is freshly pruned (i.e. just cached)", () => {
        it("it should resolve with the FROM_CACHE_PROP_NAME prop set to false", async () => {
            // Arrange
            const fakeCachingStrategy: any = {};
            const fakeResponse = {};
            const fakeRequest: any = Promise.resolve(fakeResponse);
            Object.assign(fakeRequest, {
                buffer: jest.fn().mockReturnThis(),
                expiration: jest.fn().mockReturnThis(),
                /**
                 * We make sure we process our fakeResponse with the real
                 * prune method so that we can mimic a brand new cached
                 * response.
                 */
                prune: jest.fn().mockImplementation((fn) => {
                    fn(fakeResponse, () => fakeResponse);
                    return fakeRequest;
                }),
                use: jest.fn().mockReturnThis(),
            });

            // Act
            const result = await asCachedRequest(
                fakeRequest,
                fakeCachingStrategy,
                false,
            );

            // Assert
            expect(result).toHaveProperty(FROM_CACHE_PROP_NAME, false);
        });
    });

    describe("when the request is from cache", () => {
        it("it should resolve with the FROM_CACHE_PROP_NAME prop set to true", async () => {
            // Arrange
            const fakeCachingStrategy: any = {};
            const fakeResponse = {};
            /**
             * A cached response, as the earlier test shows, gets this
             * property set to false. So, to mimic it coming from cache, we
             * set it to false first. This should then mean that it gets
             * set to true.
             */
            fakeResponse[FROM_CACHE_PROP_NAME] = false;
            const fakeRequest: any = Promise.resolve(fakeResponse);
            Object.assign(fakeRequest, {
                buffer: jest.fn().mockReturnThis(),
                expiration: jest.fn().mockReturnThis(),
                /**
                 * The function registered for prune doesn't get invoked
                 * if the response comes from the cache.
                 */
                prune: jest.fn().mockReturnThis(),
                use: jest.fn().mockReturnThis(),
            });

            // Act
            const result = await asCachedRequest(
                fakeRequest,
                fakeCachingStrategy,
                false,
            );

            // Assert
            expect(result).toHaveProperty(FROM_CACHE_PROP_NAME, true);
        });
    });
});
