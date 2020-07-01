// @flow
import {JSDOMFifteenConfiguration} from "./jsdom-fifteen-configuration.js";
import {JSDOMFifteenEnvironment} from "./jsdom-fifteen-environment.js";
import {JSDOMFifteenResourceLoader} from "./jsdom-fifteen-resource-loader.js";
import {JSDOMFifteenFileResourceLoader} from "./jsdom-fifteen-file-resource-loader.js";

export type {IJSDOMFifteenConfiguration} from "./types.js";

export const JSDOMFifteen = {
    Configuration: JSDOMFifteenConfiguration,
    Environment: JSDOMFifteenEnvironment,
    ResourceLoader: JSDOMFifteenResourceLoader,
    FileResourceLoader: JSDOMFifteenFileResourceLoader,
};
