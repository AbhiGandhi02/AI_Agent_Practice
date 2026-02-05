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

/**
 * Revenue breakdown by user tenure segment
 * Groups users into 0-6 mo, 6-12 mo, and 12+ mo segments
 */
async function getRevenueBySegment() {
  const result = await pool.query(`
    SELECT 
      CASE 
        WHEN u.tenure_months <= 6 THEN 'new (0-6 months)'
        WHEN u.tenure_months <= 12 THEN 'growing (6-12 months)'
        ELSE 'established (12+ months)'
      END AS segment,
      COUNT(DISTINCT u.user_id) AS user_count,
      SUM(pay.amount) AS total_revenue,
      ROUND(AVG(pay.amount), 2) AS avg_revenue_per_payment
    FROM users u
    JOIN subscriptions s ON u.user_id = s.user_id
    JOIN payments pay ON s.subscription_id = pay.subscription_id
    GROUP BY segment
    ORDER BY total_revenue DESC;
  `);

  return result.rows;
}

/**
 * Customer Lifetime Value (LTV) by subscription plan
 * Calculates average revenue per user and factors in retention
 */
async function getLifetimeValueByPlan() {
  const result = await pool.query(`
    SELECT 
      p.plan_name,
      p.monthly_fee,
      COUNT(DISTINCT s.user_id) AS total_users,
      ROUND(AVG(u.tenure_months), 1) AS avg_tenure_months,
      ROUND(SUM(pay.amount) / NULLIF(COUNT(DISTINCT s.user_id), 0), 2) AS avg_ltv,
      ROUND(
        (COUNT(DISTINCT s.user_id) - COUNT(DISTINCT c.user_id))::float / 
        NULLIF(COUNT(DISTINCT s.user_id), 0) * 100, 2
      ) AS retention_rate
    FROM plans p
    JOIN subscriptions s ON p.plan_id = s.plan_id
    JOIN users u ON s.user_id = u.user_id
    JOIN payments pay ON s.subscription_id = pay.subscription_id
    LEFT JOIN churn_events c ON s.user_id = c.user_id
    GROUP BY p.plan_id, p.plan_name, p.monthly_fee
    ORDER BY avg_ltv DESC;
  `);

  return result.rows;
}

/**
 * Overall revenue summary statistics
 */
async function getRevenueSummary() {
  const result = await pool.query(`
    SELECT 
      COUNT(DISTINCT pay.payment_id) AS total_payments,
      SUM(pay.amount) AS total_revenue,
      ROUND(AVG(pay.amount), 2) AS avg_payment_amount,
      COUNT(DISTINCT s.user_id) AS paying_users,
      ROUND(SUM(pay.amount) / NULLIF(COUNT(DISTINCT s.user_id), 0), 2) AS revenue_per_user
    FROM payments pay
    JOIN subscriptions s ON pay.subscription_id = s.subscription_id;
  `);

  return result.rows[0];
}

module.exports = {
  getRevenueByPlan,
  getMonthlyRevenueTrend,
  getRevenueBySegment,
  getLifetimeValueByPlan,
  getRevenueSummary
};
