require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { runAgent } = require("../src/agent/agent");
const { evaluateAnswer } = require("../src/evaluation/evaluator");

const testCases = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "agent_test_cases.json"),
    "utf-8"
  )
);

(async () => {
  let passed = 0;

  for (const test of testCases) {
    console.log(`\nRunning test: ${test.id}`);

    const response = await runAgent(test.question);

    if (response.status !== "success") {
      console.log("Agent failed to answer");
      continue;
    }

    const evaluation = evaluateAnswer(
      response.explanation,
      test
    );

    if (evaluation.pass) {
      console.log("PASSED");
      passed++;
    } else {
      console.log("FAILED");
      console.log(evaluation.details);
    }
  }

  console.log(
    `\n Result: ${passed}/${testCases.length} tests passed`
  );
})();
