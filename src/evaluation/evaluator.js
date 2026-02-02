/**
 * Evaluates AI explanation against a test case
 */
function evaluateAnswer(explanation, testCase) {
  const text = explanation.toLowerCase();

  const passedMetrics = testCase.expected_metrics.every(metric =>
    text.includes(metric.replace(/_/g, " "))
  );

  const passedInsights = testCase.expected_insights.every(insight =>
    text.includes(insight.toLowerCase())
  );

  const violatedForbidden = testCase.forbidden_insights.some(insight =>
    text.includes(insight.toLowerCase())
  );

  return {
    pass: passedMetrics && passedInsights && !violatedForbidden,
    details: {
      passedMetrics,
      passedInsights,
      violatedForbidden
    }
  };
}

module.exports = { evaluateAnswer };
