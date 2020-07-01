// @flow
/* eslint-disable import/no-commonjs */
/**
 * This is a simple JSDOM-based server.
 */

/**
 * NOTE: We import everything from index.js to ensure we're testing the public
 * interface of our package.
 */
const {runServer, Environments} = require("../../src/gateway/index.js");
/*:: import type {RenderAPI, RenderResult} from "../../src/gateway/index.js"; */

async function main() {
    const {JSDOMFifteen} = Environments;
    const config = new JSDOMFifteen.Configuration(
        () => Promise.resolve(["http://localhost:8080/render.js"]),
        (url, renderAPI) => new JSDOMFifteen.FileResourceLoader(__dirname),
        (url, fileURLs, renderAPI, vmContext) => {
            vmContext._renderAPI = renderAPI;
            vmContext._API = {
                url,
                renderAPI,
                fileURLs,
            };
            return Promise.resolve(null);
        },
    );
    const renderEnvironment = new JSDOMFifteen.Environment(config);

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
