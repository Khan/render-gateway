// @flow
/* eslint-disable import/no-commonjs */
/**
 * This is a simple local server for testing this code works.
 */

/**
 * NOTE: We import everything from index.js to ensure we're testing the public
 * interface of this package.
 */
const {runServer, Environments} = require("../../src/gateway/index.js");
/*:: import type {RenderAPI, RenderResult} from "../../src/gateway/index.js"; */

async function main() {
    const {JSDOMSixteen} = Environments;
    const config = new JSDOMSixteen.Configuration(() => Promise.resolve(["./render.js"]));
    const renderEnvironment = new JSDOMSixteen.Environment(config)

    const renderEnvironment = {
        // TODO(somewhatabstract): Implement something more complete for testing.
        render: (
            url /*: string*/,
            renderAPI /*: RenderAPI*/,
        ) /*: Promise<RenderResult>*/ =>
            Promise.resolve({
                body: `You asked us to render ${url}`,
                status: 200,
                headers: {},
            }),
    };

    runServer({
        name: "DEV_LOCAL",
        port: 8080,
        host: "127.0.0.1",

        renderEnvironment,
    });
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(`Error caught from main setup: ${err}`);
});
