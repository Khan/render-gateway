// @flow
import {JSDOMFifteen} from "./jsdom-fifteen/index.js";
import {JSDOMSixteen} from "./jsdom-sixteen/index.js";

export type * from "./jsdom-fifteen/index.js";
export type * from "./jsdom-sixteen/index.js";

export const Environments = {
    JSDOMFifteen,
    JSDOMSixteen,
};
