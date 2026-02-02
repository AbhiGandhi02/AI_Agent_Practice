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

module.exports = {
  getUsageVsChurn,
  getTopEngagedUsers
};
