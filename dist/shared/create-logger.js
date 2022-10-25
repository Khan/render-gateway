"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefaultMetadata = exports.createLogger = void 0;
var _stream = _interopRequireDefault(require("stream"));
var _winston = _interopRequireDefault(require("winston"));
var lw = _interopRequireWildcard(require("@google-cloud/logging-winston"));
var _errors = require("./errors.js");
var _getGatewayInfo = require("./get-gateway-info.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This is how the log message gets formatted.
 *
 * We can expand this to include additional metadata as needed. For example,
 * if we have the profiling API from react-render-server, we could include
 * the duration metadata.
 */
const devFormatter = ({
  level,
  message,
  ...metadata
}) => {
  const metadataString = metadata == null || Object.keys(metadata).length === 0 ? "" : ` ${JSON.stringify(metadata, null, 4)}`;
  return `${level}: ${message}${metadataString}`;
};

/**
 * Build the formatters to give us some nice dev output.
 */
const getFormatters = mode => {
  const formatters = [_winston.default.format.splat() // Allows for %s style substitutions
  ];

  if (mode === "development") {
    formatters.push(_winston.default.format.cli({
      level: true
    }));
  }

  /**
   * This must be added after the cli formatter if it is to be used in
   * the dev output.
   */
  formatters.push(_winston.default.format.printf(info => devFormatter(info)));
  return _winston.default.format.combine(...formatters);
};

/**
 * Gets the logging transport for the given mode.
 */
const getTransport = (mode, logLevel) => {
  switch (mode) {
    /**
     * Our flow types guard against misuse as long as someone is using them.
     * Let's be defensive and cope with a bad value. In that case, we'll
     * assume our test mode as it's the most inert.
     */
    default:
    case "test":
      /**
       * During testing, we just dump logging.
       * This avoids storing it anywhere and keeps it out of our
       * test output.
       * To do this, we use a stream that just writes to nowhere.
       *
       * If you want to test logging, you can jest.spy on the logger's
       * log method, or any other of its more specific logging methods.
       */
      const sink = new _stream.default.Writable({
        write: () => {}
      });
      /**
       * This is a hack to make our writable stream work
       */
      // $FlowFixMe[cannot-write]
      // $FlowFixMe[method-unbinding]
      sink._write = sink.write;
      return new _winston.default.transports.Stream({
        format: getFormatters("test"),
        stream: sink
      });
    case "development":
      /**
       * If we're in dev mode, just use a console transport.
       */
      return new _winston.default.transports.Console({
        format: getFormatters("development")
      });
    case "production":
      /**
       * We must be in production, so we will use the Stackdriver logging
       * setup.
       *
       * The Google-provided logging-winston middleware, which adds a log
       * property to the express request, looks for this transport before
       * adding its own (if it didn't, we would get double logging of
       * each message we logged).
       */
      return new lw.LoggingWinston({
        level: logLevel
      });
  }
};

/**
 * Get default metadata to attach to logs.
 */
const getDefaultMetadata = () => {
  const {
    instance,
    pid
  } = (0, _getGatewayInfo.getGatewayInfo)();
  return {
    instanceID: instance,
    processID: pid
  };
};

/**
 * Create a logger for the given runtime mode and log level.
 */
exports.getDefaultMetadata = getDefaultMetadata;
const createLogger = (runtimeMode, logLevel) => {
  const winstonLogger = _winston.default.createLogger({
    level: logLevel,
    transports: getTransport(runtimeMode, logLevel),
    format: _winston.default.format(info => {
      // Let's make sure that errors reported without a taxonomic
      // label get labelled.
      if (info.level === "error" && info.kind == null) {
        info.kind = _errors.Errors.Internal;
      }
      return info;
    })(),
    defaultMeta: getDefaultMetadata()
  });
  winstonLogger.debug(`Created logger (Level=${logLevel} Mode=${runtimeMode})`);
  return winstonLogger;
};
exports.createLogger = createLogger;
//# sourceMappingURL=create-logger.js.map