// @flow
import * as Shared from "../../../shared/index.js";
import {logRequestInfoMiddleware} from "../log-request-info-middleware.js";

jest.mock("../../../shared/index.js");

describe("#logRequestInfoMiddleware", () => {
    it("should log the request info", async () => {
        // Arrange
        const fakeNext = jest.fn();
        const fakeLogger = {
            info: jest.fn(),
        };
        const fakeRequest: any = {
            url: "URL",
            headers: {
                HEADER: "VALUE",
                ANOTHER: "ANOTHER VALUE",
            },
            method: "GET",
        };
        const fakeResponse: any = {};
        jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);

        // Act
        logRequestInfoMiddleware(fakeRequest, fakeResponse, fakeNext);

        // Assert
        expect(fakeLogger.info).toHaveBeenCalledTimes(1);
        expect(fakeLogger.info.mock.calls[0]).toMatchInlineSnapshot(`
Array [
  "Request received: URL",
  Object {
    "headers": "HEADER: VALUE
ANOTHER: ANOTHER VALUE
",
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
            info: jest.fn(),
        };
        const fakeRequest: any = {
            url: "URL",
            headers: {
                HEADER: "VALUE",
            },
            method: "GET",
        };
        const fakeResponse: any = {};
        jest.spyOn(Shared, "getLogger").mockReturnValue(fakeLogger);

        // Act
        logRequestInfoMiddleware(fakeRequest, fakeResponse, fakeNext);

        // Assert
        expect(fakeNext).toHaveBeenCalledTimes(1);
    });
});
