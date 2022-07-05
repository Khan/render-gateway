// eslint-disable-next-line import/no-commonjs
module.exports = {
    extends: ["@khanacademy"],
    plugins: ["import", "promise", "disable", "ft-flow"],
    settings: {
        "eslint-plugin-disable": {
            paths: {
                react: ["./*.js", "src/*.js"],
            },
        },
    },
    rules: {
        "ft-flow/no-types-missing-file-annotation": "error",
        "import/no-unresolved": "error",
        "import/named": "error",
        "import/default": "error",
        "import/no-absolute-path": "error",
        "import/no-self-import": "error",
        "import/no-useless-path-segments": "error",
        "import/no-named-as-default": "error",
        "import/no-named-as-default-member": "error",
        "import/no-deprecated": "error",
        "import/no-commonjs": "error",
        "import/first": "error",
        "import/no-duplicates": "error",
        "import/order": [
            "error",
            {
                groups: ["builtin", "external"],
            },
        ],
        "import/newline-after-import": "error",
        "import/no-unassigned-import": "error",
        "import/no-named-default": "error",
        "import/extensions": [
            "error",
            "always",
            {
                ignorePackages: true,
            },
        ],
        "promise/always-return": "error",
        "promise/no-return-wrap": "error",
        "promise/param-names": "error",
        "promise/catch-or-return": "error",
        "promise/no-new-statics": "error",
        "promise/no-return-in-finally": "error",
    },
    overrides: [
        {
            files: ["**/__tests__/**/*.test.js"],
            rules: {
                "max-lines": "off",
            },
        },
    ],
};
