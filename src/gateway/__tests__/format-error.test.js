// @flow
import {formatError} from "../format-error.js";

describe("#formatError", () => {
    it("should return just the stringified error if no format string given", () => {
        // Arrange
        const error = {
            some: "important",
            things: true,
        };

        // Act
        const result = formatError(undefined, error);

        // Assert
        expect(result).toMatchInlineSnapshot(`
            "{
            4\\"some\\": \\"important\\",
            4\\"things\\": true
            }"
        `);
    });

    it("should return just the format string if it does not contain {error}", () => {
        // Arrange
        const error = {
            some: "important",
            things: true,
        };

        // Act
        const result = formatError(
            "An error message without room for the error.",
            error,
        );

        // Assert
        expect(result).toMatchInlineSnapshot(
            `"An error message without room for the error."`,
        );
    });

    it("should return the format string with {error} replaced by the stringified error if format string contains {error}", () => {
        // Arrange
        const error = {
            some: "important",
            things: true,
        };

        // Act
        const result = formatError(
            "An error message. The error is {error}.",
            error,
        );

        // Assert
        expect(result).toMatchInlineSnapshot(`
            "An error message. The error is {
            4\\"some\\": \\"important\\",
            4\\"things\\": true
            }."
        `);
    });
});
