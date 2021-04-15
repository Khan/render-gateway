// @flow
import {Errors} from "../errors.js";
import KAError from "../ka-error.js";

import * as ExtractError from "../extract-error.js";

jest.mock("../extract-error.js");

describe("KAError", () => {
    it.each(Object.values(Errors))(
        "should set the name of the error to include the kind %s",
        (kind) => {
            // Arrange

            // Act
            const {name: result} = new KAError("MESSAGE", kind);

            // Assert
            expect(result).toBe(`KA${kind}Error`);
        },
    );

    it.each(Object.values(Errors))(
        "should set the kind of the error to %s",
        (kind) => {
            // Arrange

            // Act
            const {kind: result} = new KAError("MESSAGE", kind);

            // Assert
            expect(result).toBe(kind);
        },
    );

    it("should extract a simplified error for a provided source error", () => {
        // Arrange
        const extractErrorSpy = jest.spyOn(ExtractError, "extractError");
        const sourceError = new Error("SOURCE ERROR");

        // Act
        // eslint-disable-next-line no-new
        new KAError("MESSAGE", Errors.Internal, sourceError);

        // Assert
        expect(extractErrorSpy).toHaveBeenCalledWith(sourceError);
    });

    it("should set the sourceError of the error to the simplified version of the source error provided", () => {
        // Arrange
        jest.spyOn(ExtractError, "extractError").mockReturnValue("SIMPLIFIED");
        const sourceError = new Error("SOURCE ERROR");

        // Act
        const {sourceError: result} = new KAError(
            "MESSAGE",
            Errors.Internal,
            sourceError,
        );

        // Assert
        expect(result).toBe("SIMPLIFIED");
    });
});
