// @noflow
/**
 * This is a simple local server for testing this code works.
 */
// eslint-disable-next-line import/no-commonjs
const {default: runServer} = require("./src/index.js");

async function main() {
    runServer({name: "DEV_LOCAL", port: 8080});
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(`Error caught from main setup: ${err}`);
});
