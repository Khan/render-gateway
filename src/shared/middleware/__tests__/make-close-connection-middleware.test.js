// @flow
import {makeCloseConnectionMiddleware} from "../make-close-connection-middleware.js";

describe("makeCloseConnectionMiddleware", () => {
    it("should log memory usage", async () => {
        // Arrange
        const middleware = makeCloseConnectionMiddleware();
        const resSpy: any = {
            set: jest.fn(),
        };

        // Act
        // $FlowIgnore[incompatible-call] We know this is OK.
        // $FlowIgnore[not-a-function] We know this is OK.
        await middleware(({}: any), resSpy, jest.fn());

        // Assert
        expect(resSpy.set).toHaveBeenCalledWith("Connection", "close");
    });
});
