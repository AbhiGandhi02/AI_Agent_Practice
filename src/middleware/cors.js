const cors = require("cors");
const config = require("../config/env");

/**
 * CORS configuration
 * Allows cross-origin requests from specified origins
 */
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // Check if origin is in allowed list
        if (config.corsOrigins.includes(origin)) {
            callback(null, true);
        } else if (config.isDevelopment()) {
            // Allow all origins in development
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    maxAge: 86400 // 24 hours
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
