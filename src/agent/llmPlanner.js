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

Available tools:

REVENUE TOOLS:
- getRevenueByPlan: Total revenue breakdown by subscription plan
- getMonthlyRevenueTrend: Monthly revenue over time
- getRevenueBySegment: Revenue breakdown by user tenure segment (new, growing, established)
- getLifetimeValueByPlan: Customer lifetime value (LTV) per plan with retention rates
- getRevenueSummary: Overall revenue summary statistics

CHURN TOOLS:
- getChurnRateByPlan: Churn rate for each subscription plan
- getOverallChurnRate: Overall platform churn percentage
- getEarlyChurnRate: Churn rate for users in first 6 months
- getChurnVsPrice: Price sensitivity analysis - churn vs plan price
- getAverageTenureChurnedUsers: Average tenure of churned vs retained users
- getChurnSummary: Overall churn stats including top reasons
- getEarlyChurnContribution: What percentage of total churn comes from early users

USAGE TOOLS:
- getUsageVsChurn: Usage patterns for churned vs retained users
- getTopEngagedUsers: Top 10 most active users by event count
- getAverageUsageChurnedUsers: Average usage per user for churned vs retained
- getTopUsageUsersWithPlans: Top engaged users with their plan details

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
