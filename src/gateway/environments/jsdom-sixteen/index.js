// @flow
import {JSDOMSixteenConfiguration} from "./jsdom-sixteen-configuration.js";
import {JSDOMSixteenEnvironment} from "./jsdom-sixteen-environment.js";
import {JSDOMSixteenResourceLoader} from "./jsdom-sixteen-resource-loader.js";

export type {IJSDOMSixteenConfiguration} from "./types.js";

export const JSDOMSixteen = {
    Configuration: JSDOMSixteenConfiguration,
    Environment: JSDOMSixteenEnvironment,
    ResourceLoader: JSDOMSixteenResourceLoader,
};
