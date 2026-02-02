CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signup_date DATE NOT NULL,
  gender VARCHAR(10),
  seniority_level BOOLEAN,
  country VARCHAR(50),
  tenure_months INT
);

CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_signup_date ON users(signup_date);

-- PLANS
CREATE TABLE plans (
  plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_name VARCHAR(50) UNIQUE NOT NULL,
  monthly_fee DECIMAL(10,2) NOT NULL,
  contract_type VARCHAR(20)
);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) CHECK (status IN ('ACTIVE','CANCELLED')),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (plan_id) REFERENCES plans(plan_id)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- PAYMENTS
CREATE TABLE payments (
  payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(20),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id)
);

CREATE INDEX idx_payments_date ON payments(payment_date);

-- USAGE EVENTS
CREATE TABLE usage_events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  event_type VARCHAR(50),
  event_date DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_usage_user ON usage_events(user_id);

-- CHURN EVENTS
CREATE TABLE churn_events (
  churn_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  churn_date DATE NOT NULL,
  churn_reason VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_churn_date ON churn_events(churn_date);
