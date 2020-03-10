// @flow
import {extractErrorString} from "../extract-error-string.js";

describe("#extractErrorString", () => {
    it("should return the error if it is a string", () => {
        // Arrange
        const error = "THIS IS AN ERROR!";

        // Act
        const result = extractErrorString(error);

        // Assert
        expect(result).toBe(error);
    });

    it.each([
        ["THIS IS A STACK!", "THIS IS THE ERROR!: THIS IS A STACK!"],
        [undefined, "THIS IS THE ERROR!: "],
    ])(
        "should return string if error has response property with error property",
        (stack, expectation) => {
            // Arrange
            const error = {
                response: {
                    error: "THIS IS THE ERROR!",
                },
                stack,
            };

            // Act
            const result = extractErrorString(error);

            // Assert
            expect(result).toBe(expectation);
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
        const result = extractErrorString(error);

        // Assert
        expect(result).toBe("THIS IS THE ERROR!");
    });

    it("should return the stack if it exists", () => {
        // Arrange
        const error = {
            stack: "THIS IS THE STACK!",
        };

        // Act
        const result = extractErrorString(error);

        // Assert
        expect(result).toBe("THIS IS THE STACK!");
    });

    it("should return the result of toString if none of the other cases match", () => {
        // Arrange
        const error = {
            this: "IS NOT LIKE THE OTHERS",
            toString: () => "AND SO THIS IS THE ERROR!",
        };

        // Act
        const result = extractErrorString(error);

        // Assert
        expect(result).toBe("AND SO THIS IS THE ERROR!");
    });

    it("should not recurse if the error's error property is itself", () => {
        // Arrange
        let error;
        // eslint-disable-next-line prefer-const
        error = {
            error: {
                error,
                stack: "THIS IS CYCLIC SO HERE'S A STACK",
            },
        };
        const actualError = {
            error,
        };

        // Act
        const result = extractErrorString(actualError);

        // Assert
        expect(result).toBe("THIS IS CYCLIC SO HERE'S A STACK");
    });
});
