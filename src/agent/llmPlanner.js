const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * LLM Planner:
 * Converts user question → execution plan
 */
async function llmPlanQuestion(question) {
  const systemPrompt = `
You are an AI planner for a data analytics agent.

Your job:
- Decide whether the question can be answered USING THE AVAILABLE TOOLS
- Reasoning, comparison, and explanation are ALLOWED
- Calculations MUST come from tools, not from you
- You MUST create a plan if tools can support the reasoning
- You must NOT answer the question directly

Allowed tools:
- getRevenueByPlan
- getMonthlyRevenueTrend
- getChurnRateByPlan
- getOverallChurnRate
- getUsageVsChurn
- getTopEngagedUsers

A question is SUPPORTED if:
- Required data can be obtained using these tools
- Explanation can be derived from tool outputs

Response format (STRICT JSON ONLY):

{
  "supported": true | false,
  "intent": "<SHORT_INTENT>",
  "steps": [
    { "tool": "<tool_name>" }
  ],
  "reason": "<only if supported is false>"
}
`;

  const userPrompt = `User question: "${question}"`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { llmPlanQuestion };
