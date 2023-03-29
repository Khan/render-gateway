// @flow
import {applyAbortablePromisesPatch} from "../apply-abortable-promises-patch.js";

describe("#applyAbortablePromisesPatch", () => {
    afterEach(() => {
        // $FlowIgnore[prop-missing]
        delete Promise.prototype.abort;
    });

    it("should add an abort method to the promise prototype", () => {
        // Arrange

        // Act
        applyAbortablePromisesPatch();
        const result: any = Promise.resolve();

        // Assert
        expect(result.abort).toBeFunction();
    });

    it("should replace any existing abort method on the promise prototype", () => {
        // Arrange
        // $FlowIgnore[prop-missing]
        Promise.prototype.abort = "ABORT_FN";

        // Act
        applyAbortablePromisesPatch();
        const result: any = Promise.resolve();

        // Assert
        expect(result.abort).toBeFunction();
    });

    it("should not delete the existing function if it was applied by us", () => {
        // Arrange
        applyAbortablePromisesPatch();
        // $FlowIgnore[prop-missing]
        const abortFn = Promise.prototype.abort;

        // Act
        applyAbortablePromisesPatch();
        const result: any = Promise.resolve();

        // Assert
        expect(result.abort).toBe(abortFn);
    });

    it("should delete the existing function if it was applied by us and force is true", () => {
        // Arrange
        applyAbortablePromisesPatch();
        // $FlowIgnore[prop-missing]
        const abortFn = Promise.prototype.abort;

        // Act
        applyAbortablePromisesPatch(true);
        const result: any = Promise.resolve();

        // Assert
        expect(result.abort).not.toBe(abortFn);
        expect(result.abort).toBeFunction();
    });
});
