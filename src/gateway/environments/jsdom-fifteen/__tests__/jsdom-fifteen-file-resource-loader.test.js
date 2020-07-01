// @flow
import path from "path";
import * as JSDOM from "jsdom15";

import * as ApplyAbortablePromisesPatch from "../../shared/apply-abortable-promises-patch.js";

import {JSDOMFifteenFileResourceLoader} from "../jsdom-fifteen-file-resource-loader.js";

jest.mock("jsdom15");
jest.mock("../../shared/apply-abortable-promises-patch.js");

describe("JSDOMFifteenFileResourceLoader", () => {
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
            new JSDOMFifteenFileResourceLoader(__dirname);

            // Assert
            expect(applyAbortablePromisesPatchSpy).toHaveBeenCalledBefore(
                resourceLoaderSpy,
            );
        });

        it("should throw if rootDir is omitted", () => {
            // Arrange

            // Act
            const underTest = () =>
                new JSDOMFifteenFileResourceLoader((null: any));

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
            const underTest = new JSDOMFifteenFileResourceLoader(__dirname);

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
