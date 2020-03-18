// @flow
import * as StatusCodes from "../status-codes.js";

describe("#ok", () => {
    it("should return a 200 OK code", () => {
        // Arrange

        // Act
        const result = StatusCodes.ok();

        // Assert
        expect(result).toStrictEqual({code: 200});
    });
});

describe("#notFound", () => {
    it("should return a 404 Not Found code", () => {
        // Arrange

        // Act
        const result = StatusCodes.notFound();

        // Assert
        expect(result).toStrictEqual({code: 404});
    });
});

describe("#redirect", () => {
    it("should throw if the URL is omitted", () => {
        // Arrange

        // Act
        const underTest = () => StatusCodes.redirect("");

        // Assert
        expect(underTest).toThrowErrorMatchingInlineSnapshot(
            `"Must provide a target URL for the redirect."`,
        );
    });

    it("should return a 301 Moved Permanently code when isPermanent is true", () => {
        // Arrange

        // Act
        const result = StatusCodes.redirect("URL", true);

        // Assert
        expect(result).toStrictEqual({code: 301, targetURL: "URL"});
    });

    it("should return a 302 Found code when isPermanent is false", () => {
        // Arrange

        // Act
        const result = StatusCodes.redirect("URL", false);

        // Assert
        expect(result).toStrictEqual({code: 302, targetURL: "URL"});
    });

    it("should return a 302 Found code when isPermanent is omitted", () => {
        // Arrange

        // Act
        const result = StatusCodes.redirect("URL");

        // Assert
        expect(result).toStrictEqual({code: 302, targetURL: "URL"});
    });
});
