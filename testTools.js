const tools = require("./src/tools/toolRegistry");

(async () => {
  console.log("Revenue by plan:");
  console.log(await tools.getRevenueByPlan());

  console.log("\nOverall churn rate:");
  console.log(await tools.getOverallChurnRate());
})();
