const express = require("express");
const config = require("./config/env");

// Middleware
const corsMiddleware = require("./middleware/cors");
const { httpLogger, logger } = require("./middleware/logger");
const { rateLimiter } = require("./middleware/rateLimiter");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// Routes
const agentRoutes = require("./routes/agentRoutes");

const app = express();

// =====================
// Middleware Stack
// =====================

// 1. Request logging (first - logs all requests)
app.use(httpLogger);

// 2. CORS
app.use(corsMiddleware);

// 3. Rate limiting
app.use(rateLimiter);

// 4. Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// =====================
// Routes
// =====================

// Health check (no rate limiting applied)
app.get("/health", (_, res) => {
  res.json({
    status: "ADA backend running",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use("/api", agentRoutes);

// =====================
// Error Handling
// =====================

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// =====================
// Server Start
// =====================

app.listen(config.port, () => {
  logger.info({
    port: config.port,
    environment: config.nodeEnv,
    corsOrigins: config.corsOrigins
  }, `ADA backend running on port ${config.port}`);
});

module.exports = app;
