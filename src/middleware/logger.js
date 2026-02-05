const pino = require("pino");
const pinoHttp = require("pino-http");
const config = require("../config/env");

/**
 * Base logger configuration
 */
const loggerOptions = {
    level: config.logLevel,

    // Use pino-pretty in development for readable logs
    transport: config.isDevelopment()
        ? {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname"
            }
        }
        : undefined,

    // Base properties included in every log
    base: {
        env: config.nodeEnv
    },

    // Timestamp format
    timestamp: pino.stdTimeFunctions.isoTime
};

/**
 * Create base logger instance
 */
const logger = pino(loggerOptions);

/**
 * HTTP request logging middleware
 */
const httpLogger = pinoHttp({
    logger,

    // Customize what gets logged
    customProps: (req, res) => ({
        requestId: req.id
    }),

    // Customize log level based on response
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    },

    // Customize success message
    customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} completed`;
    },

    // Customize error message
    customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.url} failed: ${err.message}`;
    },

    // Redact sensitive data
    serializers: {
        req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
            // Don't log request body (may contain sensitive data)
        }),
        res: (res) => ({
            statusCode: res.statusCode
        })
    }
});

module.exports = {
    logger,
    httpLogger
};
