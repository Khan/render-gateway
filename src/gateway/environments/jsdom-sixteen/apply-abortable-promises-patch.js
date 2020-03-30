// @flow
/**
 * JSDOM assumes that all fetchs are abortable. However, this is not always
 * the case, due to how some can be regular promises.
 *
 * Though we try to mitigate this in our various request implementations, this
 * is our last chance catch all that ensures the promise prototype has an abort
 * call.
 *
 * By making sure this exists, JSDOM does not throw when closing down an
 * instance and we can guarantee that all truly abortable requests are actually
 * aborted.
 */
export const applyAbortablePromisesPatch = (): void => {
    /**
     * We know that this doesn't exist on the promise type.
     * But we're getting rid of it if it does and it is not ours.
     * Other things can replace it if they so choose.
     * $FlowIgnore
     */
    if (Promise.prototype.abort && !Promise.prototype.abort.__rrs_patched__) {
        // $FlowIgnore
        delete Promise.prototype.abort;
    }

    /**
     * Make a noop and tag it as our patched version (that way we prevent
     * patching more than once).
     */
    const ourAbort = () => {};
    ourAbort.__rrs_patched__ = true;

    /**
     * We still know that this doesn't exist on the promise type.
     * $FlowIgnore
     */
    Promise.prototype.abort = ourAbort;
};
