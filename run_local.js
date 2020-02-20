// @flow
/* eslint-disable import/no-commonjs */
/**
 * This is a simple local server for testing this code works.
 */

/**
 * NOTE: We import everyting from index.js to ensure we're testing the public
 * interface of this package.
 */
const {runServer} = require("./src/index.js");

async function main() {
    runServer({
        name: "DEV_LOCAL",
        port: 8080,
    });
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(`Error caught from main setup: ${err}`);
});
