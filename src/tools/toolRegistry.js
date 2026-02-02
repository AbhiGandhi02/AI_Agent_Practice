const revenue = require("../analytics/revenue");
const churn = require("../analytics/churn");
const usage = require("../analytics/usage");

const tools = {
  getRevenueByPlan: revenue.getRevenueByPlan,
  getMonthlyRevenueTrend: revenue.getMonthlyRevenueTrend,

  getChurnRateByPlan: churn.getChurnRateByPlan,
  getOverallChurnRate: churn.getOverallChurnRate,

  getUsageVsChurn: usage.getUsageVsChurn,
  getTopEngagedUsers: usage.getTopEngagedUsers
};

module.exports = tools;
