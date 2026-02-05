const pool = require("../../config/db");

async function getUsageVsChurn() {
  const result = await pool.query(`
    SELECT
      CASE WHEN c.user_id IS NULL THEN 'retained' ELSE 'churned' END AS status,
      COUNT(u.event_id) AS usage_count
    FROM usage_events u
    LEFT JOIN churn_events c ON u.user_id = c.user_id
    GROUP BY status;
  `);

  return result.rows;
}

async function getTopEngagedUsers(limit = 10) {
  const result = await pool.query(`
    SELECT u.user_id, COUNT(e.event_id) AS usage_count
    FROM users u
    JOIN usage_events e ON u.user_id = e.user_id
    GROUP BY u.user_id
    ORDER BY usage_count DESC
    LIMIT $1;
  `, [limit]);

  return result.rows;
}

/**
 * Average usage count for churned users vs retained users
 */
async function getAverageUsageChurnedUsers() {
  const result = await pool.query(`
    SELECT 
      CASE WHEN c.user_id IS NULL THEN 'retained' ELSE 'churned' END AS user_status,
      COUNT(DISTINCT u.user_id) AS user_count,
      ROUND(COUNT(e.event_id)::float / NULLIF(COUNT(DISTINCT u.user_id), 0), 2) AS avg_usage_per_user
    FROM users u
    LEFT JOIN usage_events e ON u.user_id = e.user_id
    LEFT JOIN churn_events c ON u.user_id = c.user_id
    GROUP BY user_status
    ORDER BY avg_usage_per_user DESC;
  `);

  return result.rows;
}

/**
 * Top engaged users with their subscription plan information
 */
async function getTopUsageUsersWithPlans(limit = 10) {
  const result = await pool.query(`
    SELECT 
      u.user_id,
      p.plan_name,
      p.monthly_fee,
      COUNT(e.event_id) AS usage_count,
      u.tenure_months,
      CASE WHEN c.user_id IS NULL THEN 'retained' ELSE 'churned' END AS status
    FROM users u
    JOIN usage_events e ON u.user_id = e.user_id
    JOIN subscriptions s ON u.user_id = s.user_id
    JOIN plans p ON s.plan_id = p.plan_id
    LEFT JOIN churn_events c ON u.user_id = c.user_id
    GROUP BY u.user_id, p.plan_name, p.monthly_fee, u.tenure_months, c.user_id
    ORDER BY usage_count DESC
    LIMIT $1;
  `, [limit]);

  return result.rows;
}

module.exports = {
  getUsageVsChurn,
  getTopEngagedUsers,
  getAverageUsageChurnedUsers,
  getTopUsageUsersWithPlans
};
