/**
 * Planner decides:
 * - Is the question supported?
 * - What analysis steps are needed?
 */

function planQuestion(question) {
  const q = question.toLowerCase();

  // ---- Revenue related ----
  if (q.includes("revenue") && q.includes("plan")) {
    return {
      supported: true,
      intent: "REVENUE_BY_PLAN",
      steps: [
        { tool: "getRevenueByPlan" },
        { tool: "getChurnRateByPlan" }
      ]
    };
  }

  // ---- Revenue trend ----
  if (q.includes("revenue") && q.includes("time")) {
    return {
      supported: true,
      intent: "REVENUE_TREND",
      steps: [
        { tool: "getMonthlyRevenueTrend" }
      ]
    };
  }

  // ---- Churn analysis ----
  if (q.includes("churn") && q.includes("plan")) {
    return {
      supported: true,
      intent: "CHURN_BY_PLAN",
      steps: [
        { tool: "getOverallChurnRate" },
        { tool: "getChurnRateByPlan" }
      ]
    };
  }

  // ---- Usage vs churn ----
  if (q.includes("usage") && q.includes("churn")) {
    return {
      supported: true,
      intent: "USAGE_VS_CHURN",
      steps: [
        { tool: "getUsageVsChurn" }
      ]
    };
  }

  // ---- Unsupported ----
  return {
    supported: false,
    reason: "Question not supported with current data and tools"
  };
}

module.exports = { planQuestion };
