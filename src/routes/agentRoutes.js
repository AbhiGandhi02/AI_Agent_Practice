const express = require("express");
const { runAgent } = require("../agent/agent");

const router = express.Router();

/**
 * POST /ask
 * Body: { "question": "..." }
 */
router.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({
      error: "Question is required"
    });
  }

  try {
    const response = await runAgent(question);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Agent failed to process the question"
    });
  }
});

module.exports = router;
