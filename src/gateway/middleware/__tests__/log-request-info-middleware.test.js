// @flow
import * as KAShared from "../../../ka-shared/index.js";
import {logRequestInfoMiddleware} from "../log-request-info-middleware.js";

jest.mock("../../../ka-shared/index.js");

describe("#logRequestInfoMiddleware", () => {
    it("should log the request info", async () => {
        // Arrange
        const fakeNext = jest.fn();
        const fakeLogger = {
            debug: jest.fn(),
        };
        const fakeRequest: any = {
            url: "URL",
            headers: {
                HEADER: "VALUE",
            },
            method: "GET",
        };
        const fakeResponse: any = {};
        jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);

        // Act
        logRequestInfoMiddleware(fakeRequest, fakeResponse, fakeNext);

        // Assert
        expect(fakeLogger.debug).toHaveBeenCalledTimes(1);
        expect(fakeLogger.debug.mock.calls[0]).toMatchInlineSnapshot(`
            Array [
              "Request received: URL",
              Object {
                "headers": Object {
                  "HEADER": "VALUE",
                },
                "method": "GET",
                "url": "URL",
              },
            ]
        `);
    });

    it("should continue", async () => {
        // Arrange
        const fakeNext = jest.fn();
        const fakeLogger = {
            debug: jest.fn(),
        };
        const fakeRequest: any = {
            url: "URL",
            headers: {
                HEADER: "VALUE",
            },
            method: "GET",
        };
        const fakeResponse: any = {};
        jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);

        // Act
        logRequestInfoMiddleware(fakeRequest, fakeResponse, fakeNext);

        // Assert
        expect(fakeNext).toHaveBeenCalledTimes(1);
    });
});
