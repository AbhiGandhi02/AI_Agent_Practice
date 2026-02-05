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

/**
 * Early churn rate - users who churn within first 6 months
 */
async function getEarlyChurnRate() {
  const result = await pool.query(`
    SELECT 
      COUNT(DISTINCT c.user_id) AS early_churned_users,
      (SELECT COUNT(*) FROM users WHERE tenure_months <= 6) AS total_early_users,
      ROUND(
        COUNT(DISTINCT c.user_id)::float / 
        NULLIF((SELECT COUNT(*) FROM users WHERE tenure_months <= 6), 0) * 100, 2
      ) AS early_churn_rate_percent
    FROM churn_events c
    JOIN users u ON c.user_id = u.user_id
    WHERE u.tenure_months <= 6;
  `);

  return result.rows[0];
}

/**
 * Price sensitivity analysis - churn rates by plan price
 */
async function getChurnVsPrice() {
  const result = await pool.query(`
    SELECT 
      p.plan_name,
      p.monthly_fee,
      COUNT(DISTINCT s.user_id) AS total_subscribers,
      COUNT(DISTINCT c.user_id) AS churned_users,
      ROUND(
        COUNT(DISTINCT c.user_id)::float / 
        NULLIF(COUNT(DISTINCT s.user_id), 0) * 100, 2
      ) AS churn_rate_percent,
      CASE 
        WHEN p.monthly_fee < 50 THEN 'low price'
        WHEN p.monthly_fee < 100 THEN 'medium price'
        ELSE 'high price'
      END AS price_tier
    FROM plans p
    JOIN subscriptions s ON p.plan_id = s.plan_id
    LEFT JOIN churn_events c ON s.user_id = c.user_id
    GROUP BY p.plan_id, p.plan_name, p.monthly_fee
    ORDER BY p.monthly_fee;
  `);

  return result.rows;
}

/**
 * Average tenure of churned users
 */
async function getAverageTenureChurnedUsers() {
  const result = await pool.query(`
    SELECT 
      ROUND(AVG(u.tenure_months), 1) AS avg_tenure_churned,
      ROUND(
        (SELECT AVG(tenure_months) FROM users 
         WHERE user_id NOT IN (SELECT user_id FROM churn_events)), 1
      ) AS avg_tenure_retained,
      MIN(u.tenure_months) AS min_tenure,
      MAX(u.tenure_months) AS max_tenure
    FROM users u
    JOIN churn_events c ON u.user_id = c.user_id;
  `);

  return result.rows[0];
}

/**
 * Overall churn summary statistics
 */
async function getChurnSummary() {
  const result = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM churn_events) AS total_churned,
      (SELECT COUNT(*) FROM users) AS total_users,
      ROUND(
        (SELECT COUNT(*) FROM churn_events)::float / 
        NULLIF((SELECT COUNT(*) FROM users), 0) * 100, 2
      ) AS overall_churn_rate,
      (
        SELECT churn_reason 
        FROM churn_events 
        GROUP BY churn_reason 
        ORDER BY COUNT(*) DESC 
        LIMIT 1
      ) AS top_churn_reason,
      ROUND(
        (SELECT AVG(tenure_months) FROM users u 
         JOIN churn_events c ON u.user_id = c.user_id), 1
      ) AS avg_tenure_churned_users;
  `);

  return result.rows[0];
}

/**
 * Early churn contribution to total churn
 */
async function getEarlyChurnContribution() {
  const result = await pool.query(`
    SELECT 
      COUNT(DISTINCT CASE WHEN u.tenure_months <= 6 THEN c.user_id END) AS early_churned,
      COUNT(DISTINCT c.user_id) AS total_churned,
      ROUND(
        COUNT(DISTINCT CASE WHEN u.tenure_months <= 6 THEN c.user_id END)::float / 
        NULLIF(COUNT(DISTINCT c.user_id), 0) * 100, 2
      ) AS early_churn_contribution_percent
    FROM churn_events c
    JOIN users u ON c.user_id = u.user_id;
  `);

  return result.rows[0];
}

module.exports = {
  getChurnRateByPlan,
  getOverallChurnRate,
  getEarlyChurnRate,
  getChurnVsPrice,
  getAverageTenureChurnedUsers,
  getChurnSummary,
  getEarlyChurnContribution
};
