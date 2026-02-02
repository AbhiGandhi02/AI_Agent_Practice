const pool = require("../../config/db");

async function getRevenueByPlan() {
  const result = await pool.query(`
    SELECT p.plan_name, SUM(pay.amount) AS total_revenue
    FROM payments pay
    JOIN subscriptions s ON pay.subscription_id = s.subscription_id
    JOIN plans p ON s.plan_id = p.plan_id
    GROUP BY p.plan_name
    ORDER BY total_revenue DESC;
  `);

  return result.rows;
}

async function getMonthlyRevenueTrend() {
  const result = await pool.query(`
    SELECT DATE_TRUNC('month', payment_date) AS month,
           SUM(amount) AS revenue
    FROM payments
    GROUP BY month
    ORDER BY month;
  `);

  return result.rows;
}

module.exports = {
  getRevenueByPlan,
  getMonthlyRevenueTrend
};
