// @noflow
/* eslint-disable import/no-commonjs */
/**
 * This is a simple local server for testing this code works.
 */
const {
    runServer,
    KAShared: {getLogger},
} = require("./src/index.js");

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
