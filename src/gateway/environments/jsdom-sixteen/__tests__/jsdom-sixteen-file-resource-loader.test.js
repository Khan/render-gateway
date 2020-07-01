// @flow
import path from "path";
import * as JSDOM from "jsdom16";

import * as ApplyAbortablePromisesPatch from "../apply-abortable-promises-patch.js";

import {JSDOMSixteenFileResourceLoader} from "../jsdom-sixteen-file-resource-loader.js";

jest.mock("jsdom16");
jest.mock("../apply-abortable-promises-patch.js");

describe("JSDOMSixteenFileResourceLoader", () => {
    describe("#constructor", () => {
        it("should invoke applyAbortablePromisesPatch before super()", () => {
            // Arrange
            const applyAbortablePromisesPatchSpy = jest.spyOn(
                ApplyAbortablePromisesPatch,
                "applyAbortablePromisesPatch",
            );
            const resourceLoaderSpy = jest.spyOn(JSDOM, "ResourceLoader");

            // Act
            // eslint-disable-next-line no-new
            new JSDOMSixteenFileResourceLoader(__dirname);

            // Assert
            expect(applyAbortablePromisesPatchSpy).toHaveBeenCalledBefore(
                resourceLoaderSpy,
            );
        });

        it("should throw if rootDir is omitted", () => {
            // Arrange

            // Act
            const underTest = () =>
                new JSDOMSixteenFileResourceLoader((null: any));

            // Assert
            expect(underTest).toThrowErrorMatchingInlineSnapshot(
                `"Root folder cannot be found"`,
            );
        });
    });

    describe("#fetch", () => {
        it.each([
            "http://example.com/__data__/file-loader-test.txt",
            "./__data__/file-loader-test.txt",
            path.normalize(
                path.join(__dirname, "./__data__/file-loader-test.txt"),
            ),
        ])("should read file", async (filePath) => {
            // Arrange
            const underTest = new JSDOMSixteenFileResourceLoader(__dirname);

            // Act
            const result: any = await underTest.fetch(filePath);

            // Assert
            expect(result).toBeInstanceOf(Buffer);
            expect(result.toString()).toBe(
                "THIS IS TEST CONTENT FOR THE SNAPSHOT!",
            );
        });
    });
});
