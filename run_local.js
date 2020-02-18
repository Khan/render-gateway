// @noflow
/* eslint-disable import/no-commonjs */
/**
 * This is a simple local server for testing this code works.
 */
const {default: runServer} = require("./src/index.js");

// TODO(somewhatabstract): Everything should be imported from index.js so
// that we're testing the package interface only.
const {getLogger} = require("./src/ka-shared/get-logger.js");

async function main() {
    runServer({
        name: "DEV_LOCAL",
        port: 8080,
        logger: getLogger(),
    });
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(`Error caught from main setup: ${err}`);
});
