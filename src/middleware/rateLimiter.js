const rateLimit = require("express-rate-limit");
const config = require("../config/env");

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per IP
 */
const rateLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,

    // Return rate limit info in headers
    standardHeaders: true,
    legacyHeaders: false,

    // Custom error response
    handler: (req, res) => {
        res.status(429).json({
            error: {
                message: "Too many requests, please try again later",
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: Math.ceil(config.rateLimitWindowMs / 1000)
            }
        });
    },

    // Skip rate limiting for health checks
    skip: (req) => req.path === "/health"

    // Using default keyGenerator (handles IPv6 properly)
});

/**
 * Stricter rate limiter for expensive operations (AI API calls)
 */
const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        res.status(429).json({
            error: {
                message: "API rate limit exceeded. Please wait before making more requests.",
                code: "API_RATE_LIMIT_EXCEEDED",
                retryAfter: 60
            }
        });
    }
});

module.exports = {
    rateLimiter,
    apiRateLimiter
};
