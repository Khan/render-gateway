// @flow
import * as Shared from "../../shared/index.js";
import {getRuntimeMode} from "../get-runtime-mode.js";

jest.mock("../../shared/index.js");

describe("#getRuntimeMode", () => {
    let KA_IS_DEV_SERVER;
    beforeEach(() => {
        KA_IS_DEV_SERVER = process.env.KA_IS_DEV_SERVER;
    });

    afterEach(() => {
        process.env.KA_IS_DEV_SERVER = KA_IS_DEV_SERVER;
    });

    it("should default to production when KA_IS_DEV_SERVER is 0", () => {
        // Arrange
        process.env.KA_IS_DEV_SERVER = "0";
        const getRuntimeModeSpy = jest.spyOn(Shared, "getRuntimeMode");

        // Act
        getRuntimeMode();

        // Assert
        expect(getRuntimeModeSpy).toHaveBeenCalledWith("production");
    });

    it("should default to development when KA_IS_DEV_SERVER is 1", () => {
        // Arrange
        process.env.KA_IS_DEV_SERVER = "1";
        const getRuntimeModeSpy = jest.spyOn(Shared, "getRuntimeMode");

        // Act
        getRuntimeMode();

        // Assert
        expect(getRuntimeModeSpy).toHaveBeenCalledWith("development");
    });
});
