// @flow
/* eslint-disable import/no-commonjs */
/**
 * This is a simple JSDOM-based server.
 */

/**
 * NOTE: We import everything from index.js to ensure we're testing the public
 * interface of our package.
 */
const {runServer, Environments} = require("../../src/index.js");
/*:: import type {RenderAPI, RenderResult} from "../../src/index.js"; */

async function main() {
    const {JSDOM} = Environments;
    const config = new JSDOM.Configuration(
        () => Promise.resolve(["http://localhost:8080/render.js"]),
        (url, renderAPI) => new JSDOM.FileResourceLoader(__dirname),
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
    const renderEnvironment = new JSDOM.Environment(config);

    runServer({
        name: "DEV_LOCAL",
        port: 8080,
        host: "127.0.0.1",
        authentication: {
            headerName: "IGNORED",
            cryptoKeyPath: "IGNORED",
            secretKey: "IGNORED",
        },
        renderEnvironment,
    });
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(`Error caught from main setup: ${err}`);
});
