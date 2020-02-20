# render-gateway

[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=Khan/render-gateway&identifier=240386730)](https://dependabot.com) [![Node CI](https://github.com/Khan/render-gateway/workflows/Node%20CI/badge.svg)](https://github.com/Khan/render-gateway/actions)

The core implementation of our render-gateway service

## Development

1. Clone the repo
1. `yarn install`
1. `yarn start`

Once started, you can make code changes. `babel-watch` takes care of restarting
the server automatically to incorporate your changes as you go.

## Release Changes

Our NodeCI action will automatically update build artifacts whenever changes
are pushed to `master`. If for some reason this does not occur, this can be
performed manually by:

1. `yarn install`
2. `yarn build`
3. `git add *`
4. `git commit -m "<suitable commit message goes here>"`
