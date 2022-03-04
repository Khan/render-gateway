# render-gateway

[![codecov](https://codecov.io/gh/Khan/render-gateway/branch/main/graph/badge.svg?token=dJBz8T4PlI)](https://codecov.io/gh/Khan/render-gateway) [![Node CI](https://github.com/Khan/render-gateway/workflows/Node%20CI/badge.svg)](https://github.com/Khan/render-gateway/actions)

The core implementation of a render-gateway service.

## Development

1. Clone the repo
1. `yarn install`
1. `yarn start`

Once started, you can make code changes. `babel-watch` takes care of restarting
the server automatically to incorporate your changes as you go.

For more information on developing, contributing, and releasing, please see [our
CONTRIBUTING document](./CONTRIBUTING.md).

### Environment Variables

Some behaviors are controlled via environment variables.

| Variable | Purpose |
|----------|---------|
| `GAE_SERVICE` | This is set by Google Cloud AppEngine in production. It is used to determine the name of the gateway that is executing (see [get-gateway-info.js](src/shared/get-gateway-info.js)). |
| `GAE_VERSION` | This is set by Google Cloud AppEngine in production. It is used to determine the version of the gateway that is executing (see [get-gateway-info.js](src/shared/get-gateway-info.js)). |
| `KA_ALLOW_HEAPDUMP` | During development mode, we support importing `heapdump` so that heap snapshots can be created on-the-fly. Normally, this is not supported in production. Set `KA_ALLOW_HEAPDUMP` to enable this during production or testing. |
| `KA_IS_DEV_SERVER` | This value is ignored in favour of `NODE_ENV`. However, if the value of `NODE_ENV` is not recognized, or the variable does not exist, `KA_IS_DEV_SERVER` is used to differentiate between production or development mode. |
| `KA_LOG_LEVEL` | The default log level is `debug`. Use this environment variable to specify a different level. Valid options are listed in [get-log-level.js](src/ka-shared/get-log-level.js). |
| `NODE_ENV` | This indicates when certain development or test-mode things should be available. Possible values are `test`, `dev`, `development`, `prod`, and `production`. If `NODE_ENV` is not one of these values, we fallback to `KA_IS_DEV_SERVER` to determine between production and development. |

## Code of Conduct

We believe in fostering an open, welcoming, and collaborative environment for
all. Please read and abide by our [CODE OF CONDUCT](./CODE_OF_CONDUCT.md).
