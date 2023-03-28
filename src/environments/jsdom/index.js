// @flow
import {JSDOMConfiguration} from "./jsdom-configuration.js";
import {JSDOMEnvironment} from "./jsdom-environment.js";
import {JSDOMResourceLoader} from "./jsdom-resource-loader.js";
import {JSDOMFileResourceLoader} from "./jsdom-file-resource-loader.js";

export type {IJSDOMConfiguration} from "./types.js";

export const JSDOM = {
    Configuration: JSDOMConfiguration,
    Environment: JSDOMEnvironment,
    ResourceLoader: JSDOMResourceLoader,
    FileResourceLoader: JSDOMFileResourceLoader,
};
