const revenue = require("../analytics/revenue");
const churn = require("../analytics/churn");
const usage = require("../analytics/usage");

const tools = {
  // Revenue tools
  getRevenueByPlan: revenue.getRevenueByPlan,
  getMonthlyRevenueTrend: revenue.getMonthlyRevenueTrend,
  getRevenueBySegment: revenue.getRevenueBySegment,
  getLifetimeValueByPlan: revenue.getLifetimeValueByPlan,
  getRevenueSummary: revenue.getRevenueSummary,

  // Churn tools
  getChurnRateByPlan: churn.getChurnRateByPlan,
  getOverallChurnRate: churn.getOverallChurnRate,
  getEarlyChurnRate: churn.getEarlyChurnRate,
  getChurnVsPrice: churn.getChurnVsPrice,
  getAverageTenureChurnedUsers: churn.getAverageTenureChurnedUsers,
  getChurnSummary: churn.getChurnSummary,
  getEarlyChurnContribution: churn.getEarlyChurnContribution,

  // Usage tools
  getUsageVsChurn: usage.getUsageVsChurn,
  getTopEngagedUsers: usage.getTopEngagedUsers,
  getAverageUsageChurnedUsers: usage.getAverageUsageChurnedUsers,
  getTopUsageUsersWithPlans: usage.getTopUsageUsersWithPlans
};

module.exports = tools;
