// @flow
import {getRuntimeMode} from "../get-runtime-mode.js";

describe("#getRuntimeMode", () => {
    const NODE_ENV = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = NODE_ENV;
    });

    it.each([
        ["production", "prod"],
        ["production", "production"],
        ["development", "dev"],
        ["development", "development"],
        ["test", "test"],
    ])("should return %s for given %s", (expectation, nodeEnv) => {
        // Arrange
        process.env.NODE_ENV = nodeEnv;

        // Act
        const result = getRuntimeMode("development");

        // Assert
        expect(result).toBe(expectation);
    });

    it.each([
        ["production", undefined],
        ["development", undefined],
        ["production", "blah"],
        ["development", "blah"],
    ])("should return %s if NODE_ENV unrecognised", (expectation, nodeEnv) => {
        // Arrange
        process.env.NODE_ENV = nodeEnv;

        // Act
        const result = getRuntimeMode(expectation);

        // Assert
        expect(result).toBe(expectation);
    });

    it.each([
        ["development", "development"],
        ["production", "production"],
        ["development", "test"],
        ["production", "test"],
    ])(
        "should ignore default of %s and give precedent to NODE_ENV=%s",
        (defaultValue, nodeEnv) => {
            // Arrange
            process.env.NODE_ENV = nodeEnv;

            // Act
            const result = getRuntimeMode(defaultValue);

            // Assert
            expect(result).toBe(nodeEnv);
        },
    );
});
