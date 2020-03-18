// @flow
import {extractError} from "../extract-error.js";

describe("#extractError", () => {
    it("should return error and no stack if it is a string", () => {
        // Arrange
        const error = "THIS IS AN ERROR!";

        // Act
        const result = extractError(error);

        // Assert
        expect(result).toStrictEqual({error});
    });

    it.each([
        [
            "THIS IS A STACK!",
            {error: "THIS IS THE ERROR!", stack: "THIS IS A STACK!"},
        ],
        [undefined, {error: "THIS IS THE ERROR!", stack: undefined}],
    ])(
        "should return response error and stack if error has response property with error property",
        (stack, expectation) => {
            // Arrange
            const error = {
                response: {
                    error: "THIS IS THE ERROR!",
                },
                stack,
            };

            // Act
            const result = extractError(error);

            // Assert
            expect(result).toStrictEqual(expectation);
        },
    );

    it("should recurse if error has error child", () => {
        // Arrange
        const error = {
            error: {
                error: {
                    error: "THIS IS THE ERROR!",
                },
            },
        };

        // Act
        const result = extractError(error);

        // Assert
        expect(result).toStrictEqual({error: "THIS IS THE ERROR!"});
    });

    it("should use the stack for the error message if there is no error", () => {
        // Arrange
        const error = {
            stack: "THIS IS THE STACK!",
        };

        // Act
        const result = extractError(error);

        // Assert
        expect(result).toStrictEqual({
            error: "THIS IS THE STACK!",
            stack: "THIS IS THE STACK!",
        });
    });

    it("should have the result of toString if none of the other cases match", () => {
        // Arrange
        const error = {
            thisError: "IS NOT LIKE THE OTHERS",
            toString: () => "AND SO THIS IS THE ERROR!",
        };

        // Act
        const result = extractError(error);

        // Assert
        expect(result).toStrictEqual({
            error: "AND SO THIS IS THE ERROR!",
            stack: undefined,
        });
    });

    it("should not recurse if the error's error property is itself", () => {
        // Arrange
        let error;
        // eslint-disable-next-line prefer-const
        error = {
            error: {
                error,
                toString: () => "THIS IS THE ERROR!",
                stack: "THIS IS CYCLIC SO HERE'S A STACK",
            },
        };
        const actualError = {
            error,
        };

        // Act
        const result = extractError(actualError);

        // Assert
        expect(result).toStrictEqual({
            error: "THIS IS THE ERROR!",
            stack: "THIS IS CYCLIC SO HERE'S A STACK",
        });
    });
});
