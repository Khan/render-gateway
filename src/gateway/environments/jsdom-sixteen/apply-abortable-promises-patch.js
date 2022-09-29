// @flow
const patchedMarker = "__patched__";

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
export const applyAbortablePromisesPatch = (force?: boolean = false): void => {
    /**
     * We know that this doesn't exist on the promise type, but it does if
     * we already patched it.
     */
    if (
        !force &&
        // $FlowIgnore[prop-missing]
        Promise.prototype.abort &&
        // $FlowIgnore[incompatible-use]
        Promise.prototype.abort[patchedMarker]
    ) {
        return;
    }

    // $FlowIgnore[prop-missing]
    delete Promise.prototype.abort;

    /**
     * Make a noop and tag it as our patched version (that way we prevent
     * patching more than once).
     */
    const ourAbort = () => {};
    // We know that the inferred type is wrong here and it's not worth
    // convincing flow with a better type, so just suppress it.
    // $FlowIgnore[prop-missing]
    ourAbort[patchedMarker] = true;

    /**
     * $FlowIgnore[prop-missing]
     * We still know that this doesn't exist on the promise type.
     */
    Promise.prototype.abort = ourAbort;
};
