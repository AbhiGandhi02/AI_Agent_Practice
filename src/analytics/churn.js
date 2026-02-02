const pool = require("../../config/db");

async function getChurnRateByPlan() {
  const result = await pool.query(`
    SELECT p.plan_name,
           COUNT(c.user_id)::float / COUNT(s.user_id) AS churn_rate
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.plan_id
    LEFT JOIN churn_events c ON s.user_id = c.user_id
    GROUP BY p.plan_name;
  `);

  return result.rows;
}

async function getOverallChurnRate() {
  const result = await pool.query(`
    SELECT COUNT(*)::float /
           (SELECT COUNT(*) FROM users) AS churn_rate
    FROM churn_events;
  `);

  return result.rows[0];
}

module.exports = {
  getChurnRateByPlan,
  getOverallChurnRate
};
