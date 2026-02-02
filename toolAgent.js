const { planQuestion } = require("./src/agent/planner");
const { executePlan } = require("./src/agent/executor");

async function run() {
  const question =
    "Which subscription plan generates the highest revenue and why?";

  const plan = planQuestion(question);
  console.log("PLAN:", plan);

  if (!plan.supported) {
    console.log("Unsupported question");
    return;
  }

  const results = await executePlan(plan);
  console.log("RESULTS:", results);
}

run();
