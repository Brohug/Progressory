CREATE TABLE IF NOT EXISTS gym_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    stripe_customer_id VARCHAR(255) NULL,
    stripe_subscription_id VARCHAR(255) NULL,
    plan_code VARCHAR(50) NOT NULL DEFAULT 'none',
    billing_status VARCHAR(50) NOT NULL DEFAULT 'none',
    price_id VARCHAR(255) NULL,
    current_period_end DATETIME NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    trial_ends_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_gym_subscriptions_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_gym_subscriptions_gym
        UNIQUE (gym_id),
    CONSTRAINT uq_gym_subscriptions_customer
        UNIQUE (stripe_customer_id),
    CONSTRAINT uq_gym_subscriptions_subscription
        UNIQUE (stripe_subscription_id)
);

CREATE TABLE IF NOT EXISTS billing_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stripe_event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(150) NOT NULL,
    processed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_events_stripe_event
        UNIQUE (stripe_event_id)
);
