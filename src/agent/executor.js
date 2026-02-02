const tools = require("../tools/toolRegistry");

/**
 * Executor:
 * - Takes a plan
 * - Calls tools in order
 * - Collects results
 */
async function executePlan(plan) {
  const results = {};

  for (const step of plan.steps) {
    const toolName = step.tool;

    if (!tools[toolName]) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const data = await tools[toolName]();
    results[toolName] = data;
  }

  return results;
}

module.exports = { executePlan };
