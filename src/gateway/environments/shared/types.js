// @flow
/**
 * A thing that can be closed.
 */
export interface ICloseable {
    /**
     * Close the closeable.
     */
    +close?: () => void;
}

/**
 * Gate API for control flow.
 */
export interface IGate extends ICloseable {
    /**
     * Open the gate.
     */
    open(): void;

    /**
     * Close the gate.
     */
    close(): void;

    /**
     * True, if the gate is open; otherwise, false.
     */
    get isOpen(): boolean;
}

/**
 * Standard timer API as implemented by Node's global or a browser window.
 */
export interface ITimerAPI {
    setTimeout: $PropertyType<window, "setTimeout">;
    setInterval: $PropertyType<window, "setInterval">;
    requestAnimationFrame: $PropertyType<window, "requestAnimationFrame">;
}
