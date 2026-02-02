const { llmPlanQuestion } = require("./llmPlanner");
const { executePlan } = require("./executor");
const { explainResults } = require("./explainer");

async function runAgent(question) {
  const plan = await llmPlanQuestion(question);

  if (!plan.supported) {
    return {
      status: "unsupported",
      reason: plan.reason
    };
  }

  const data = await executePlan(plan);

  const explanation = await explainResults(
    question,
    plan.intent,
    data
  );

  return {
    status: "success",
    intent: plan.intent,
    plan: plan.steps,
    data,
    explanation
  };
}

module.exports = { runAgent };
