require("dotenv").config();

/**
 * Environment configuration
 * Centralizes all environment variables with defaults
 */
const config = {
    // Server
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT, 10) || 3000,

    // CORS
    corsOrigins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",")
        : ["http://localhost:3000", "http://localhost:5173"],

    // Rate limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

    // OpenAI
    openaiApiKey: process.env.OPENAI_API_KEY,

    // Database
    databaseUrl: process.env.DATABASE_URL,

    // Logging
    logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),

    // Helpers
    isDevelopment: () => config.nodeEnv === "development",
    isProduction: () => config.nodeEnv === "production",
    isStaging: () => config.nodeEnv === "staging"
};

module.exports = config;
