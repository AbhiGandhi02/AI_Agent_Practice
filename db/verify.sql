-- Churn by plan
SELECT p.plan_name, COUNT(c.user_id)
FROM churn_events c
JOIN subscriptions s ON c.user_id = s.user_id
JOIN plans p ON s.plan_id = p.plan_id
GROUP BY p.plan_name;

-- Revenue by plan
SELECT p.plan_name, SUM(pay.amount)
FROM payments pay
JOIN subscriptions s ON pay.subscription_id = s.subscription_id
JOIN plans p ON s.plan_id = p.plan_id
GROUP BY p.plan_name;
