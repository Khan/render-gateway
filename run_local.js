// @flow
/* eslint-disable import/no-commonjs */
/**
 * This is a simple local server for testing this code works.
 */

/**
 * NOTE: We import everyting from index.js to ensure we're testing the public
 * interface of this package.
 */
const {runServer} = require("./src/gateway/index.js");

async function main() {
    runServer({
        name: "DEV_LOCAL",
        port: 8080,
        // TODO(somewhatabstract): Implement something more complete for testing.
        renderFn: () =>
            Promise.resolve({
                body: "THIS IS A RENDERED PAGE",
                status: 200,
                headers: {},
            }),
    });
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(`Error caught from main setup: ${err}`);
});
