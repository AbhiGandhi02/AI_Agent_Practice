const config = require("../config/env");

/**
 * Global error handling middleware
 * Catches all unhandled errors and returns consistent JSON responses
 */
function errorHandler(err, req, res, next) {
    // Log the error
    const logger = req.log || console;
    logger.error({
        err: {
            message: err.message,
            stack: config.isDevelopment() ? err.stack : undefined,
            code: err.code
        },
        url: req.url,
        method: req.method
    }, "Unhandled error");

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Build error response
    const errorResponse = {
        error: {
            message: err.message || "Internal server error",
            code: err.code || "INTERNAL_ERROR"
        }
    };

    // Include stack trace in development
    if (config.isDevelopment()) {
        errorResponse.error.stack = err.stack;
    }

    // Include validation errors if present
    if (err.errors) {
        errorResponse.error.details = err.errors;
    }

    res.status(statusCode).json(errorResponse);
}

/**
 * Not found handler
 * Returns 404 for unmatched routes
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        error: {
            message: "Route not found",
            code: "NOT_FOUND",
            path: req.path
        }
    });
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
