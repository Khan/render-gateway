/* eslint-disable import/no-commonjs */
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                targets: {
                    node: "16",
                },
            },
        ],
        "@babel/preset-flow",
    ],
    plugins: [
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-optional-chaining",
    ],
    sourceMaps: true,
};
