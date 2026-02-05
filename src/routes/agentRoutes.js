const express = require("express");
const { runAgent } = require("../agent/agent");
const { validators } = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");
const { apiRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

/**
 * POST /ask
 * Body: { "question": "..." }
 * 
 * Main agent endpoint with:
 * - Input validation
 * - Stricter rate limiting (20 req/min for OpenAI calls)
 * - Async error handling
 */
router.post(
  "/ask",
  apiRateLimiter,
  validators.askQuestion,
  asyncHandler(async (req, res) => {
    const { question } = req.body;

    req.log.info({ question }, "Processing agent question");

    const response = await runAgent(question);

    req.log.info({
      status: response.status,
      intent: response.intent
    }, "Agent response completed");

    res.json(response);
  })
);

/**
 * GET /status
 * Returns agent status and available tools
 */
router.get("/status", (req, res) => {
  const tools = require("../tools/toolRegistry");

  res.json({
    status: "operational",
    availableTools: Object.keys(tools),
    toolCount: Object.keys(tools).length
  });
});

module.exports = router;
