// @flow
import * as KAShared from "../../ka-shared/index.js";
import {renderHandler} from "../render-handler.js";

jest.mock("../../ka-shared/index.js");

describe("#renderHandler", () => {
    it("should log the URL being rendered", async () => {
        // Arrange
        const fakeRequest = ({
            url: "the-route-I-passed",
        }: any);
        const fakeResponse = ({
            send: jest.fn(),
        }: any);
        const fakeLogger = {
            debug: jest.fn(),
        };
        jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);

        // Act
        await renderHandler(fakeRequest, fakeResponse);

        // Assert
        expect(fakeLogger.debug).toHaveBeenCalledWith(
            "RENDER: the-route-I-passed",
        );
    });

    it("should send a response", async () => {
        // Arrange
        const fakeRequest = ({
            url: "the-route-I-passed",
        }: any);
        const fakeResponse = ({
            send: jest.fn(),
        }: any);
        const fakeLogger = {
            debug: jest.fn(),
        };
        jest.spyOn(KAShared, "getLogger").mockReturnValue(fakeLogger);

        // Act
        await renderHandler(fakeRequest, fakeResponse);

        // Assert
        expect(fakeResponse.send).toHaveBeenCalledWith(
            "The URL you requested was the-route-I-passed",
        );
    });
});
