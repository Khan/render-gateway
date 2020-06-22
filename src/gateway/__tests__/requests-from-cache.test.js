// @flow
import {
    FROM_CACHE_PROP_NAME,
    isFromCache,
    asCachedRequest,
    asUncachedRequest,
} from "../requests-from-cache.js";

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
    it("should buffer according to the buffer option", () => {
        // Arrange
        const fakeOptions: any = {
            buffer: "FAKE_BUFFER",
        };
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asUncachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeRequest.buffer).toHaveBeenCalledWith(fakeOptions.buffer);
    });

    it("should resolve with the FROM_CACHE_PROP_NAME prop set to false", async () => {
        // Arrange
        const fakeResponse = {};
        const fakeRequest: any = Promise.resolve(fakeResponse);
        const fakeOptions: any = {};
        fakeRequest.buffer = jest.fn().mockReturnThis();

        // Act
        const result = await asUncachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(result).toHaveProperty(FROM_CACHE_PROP_NAME, false);
    });

    it("should have an abort call that invokes the original superagent request with correct this context", () => {
        // Arrange
        const fakeResponse = {};
        const fakeRequest: any = Promise.resolve(fakeResponse);
        fakeRequest._abort = jest.fn();
        fakeRequest.abort = function () {
            this._abort();
        };
        const fakeOptions: any = {};
        fakeRequest.buffer = jest.fn().mockReturnThis();

        // Act
        const wrappedRequest = asUncachedRequest(fakeOptions, fakeRequest);
        wrappedRequest.abort();

        // Assert
        expect(fakeRequest._abort).toHaveBeenCalled();
    });
});

describe("#asCachedRequest", () => {
    it("should throw if no cache plugin instance provided", () => {
        // Arrange
        const fakeOptions: any = {};
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        const underTest = () => asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(underTest).toThrowErrorMatchingInlineSnapshot(
            `"Cannot cache request without cache plugin instance."`,
        );
    });

    it("should use the superagent cache plugin instance from options", () => {
        // Arrange
        const fakeOptions: any = {
            cachePlugin: "FAKE_CACHE_PLUGIN",
        };
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeRequest.use).toHaveBeenCalledWith("FAKE_CACHE_PLUGIN");
    });

    it("should set the cache expiration to undefined if no getExpiration option", () => {
        // Arrange
        const fakeOptions: any = {
            cachePlugin: "FAKE_PLUGIN",
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
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeRequest.expiration).toHaveBeenCalledWith(undefined);
    });

    it("should get an expiration value based off the getExpiration option", () => {
        // Arrange
        const fakeOptions: any = {
            cachePlugin: "FAKE_PLUGIN",
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
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeOptions.getExpiration).toHaveBeenCalledWith("THE URL");
    });

    it("should set the cache expiration based off the caching strategy value", () => {
        // Arrange
        const fakeOptions: any = {
            cachePlugin: "FAKE_PLUGIN",
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
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeRequest.expiration).toHaveBeenCalledWith("EXPIRATION VALUE");
    });

    it("should add a custom prune function to the request caching", () => {
        // Arrange
        const fakeOptions: any = {
            cachePlugin: "FAKE_PLUGIN",
        };
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeRequest.prune).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should have an abort call that invokes the original superagent request with correct this context", () => {
        // Arrange
        /**
         * If the function works, the then will return this fake result
         * and then the abort function will be added to it that invokes the
         * abort of the original fakeRequest.
         */
        const fakeResult: any = {};
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnValue(fakeResult),
            _abort: jest.fn(),
            abort: function () {
                this._abort();
            },
        };
        const fakeOptions: any = {
            cachePlugin: "FAKE_PLUGIN",
        };
        fakeRequest.buffer = jest.fn().mockReturnThis();

        // Act
        const wrappedRequest = asCachedRequest(fakeOptions, fakeRequest);
        wrappedRequest.abort();

        // Assert
        expect(fakeRequest._abort).toHaveBeenCalled();
    });

    describe("prune operation", () => {
        it("should gut the response with the passed function", () => {
            // Arrange
            const fakeOptions: any = {
                cachePlugin: "FAKE_PLUGIN",
            };
            const fakeRequest: any = {
                buffer: jest.fn().mockReturnThis(),
                expiration: jest.fn().mockReturnThis(),
                prune: jest.fn().mockReturnThis(),
                use: jest.fn().mockReturnThis(),
                then: jest.fn().mockReturnThis(),
            };
            const fakeResponse = "FAKE_RESPONSE";
            const gutResponseFn = jest.fn().mockReturnValue({});
            asCachedRequest(fakeOptions, fakeRequest);
            const pruneFn = fakeRequest.prune.mock.calls[0][0];

            // Act
            pruneFn(fakeResponse, gutResponseFn);

            // Assert
            expect(gutResponseFn).toHaveBeenCalledWith(fakeResponse);
        });

        it("should initialize the FROM_CACHE_PROP_NAME property on the response to a non-boolean, non-falsy placeholder value", () => {
            // Arrange
            const fakeOptions: any = {
                cachePlugin: "FAKE_PLUGIN",
            };
            const fakeRequest: any = {
                buffer: jest.fn().mockReturnThis(),
                expiration: jest.fn().mockReturnThis(),
                prune: jest.fn().mockReturnThis(),
                use: jest.fn().mockReturnThis(),
                then: jest.fn().mockReturnThis(),
            };
            const fakeResponse = {};
            const gutResponseFn = jest.fn().mockReturnValue(fakeResponse);
            asCachedRequest(fakeOptions, fakeRequest);
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
        const fakeOptions: any = {
            buffer: "FAKE_BUFFER",
            cachePlugin: "FAKE_PLUGIN",
        };
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeRequest.buffer).toHaveBeenCalledWith(fakeOptions.buffer);
    });

    describe("when the request is freshly pruned (i.e. just cached)", () => {
        it("it should resolve with the FROM_CACHE_PROP_NAME prop set to false", async () => {
            // Arrange
            const fakeOptions: any = {
                cachePlugin: "FAKE_PLUGIN",
            };
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
            const result = await asCachedRequest(fakeOptions, fakeRequest);

            // Assert
            expect(result).toHaveProperty(FROM_CACHE_PROP_NAME, false);
        });
    });

    describe("when the request is from cache", () => {
        it("it should resolve with the FROM_CACHE_PROP_NAME prop set to true", async () => {
            // Arrange
            const fakeOptions: any = {
                cachePlugin: "FAKE_PLUGIN",
            };
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
            const result = await asCachedRequest(fakeOptions, fakeRequest);

            // Assert
            expect(result).toHaveProperty(FROM_CACHE_PROP_NAME, true);
        });
    });
});
