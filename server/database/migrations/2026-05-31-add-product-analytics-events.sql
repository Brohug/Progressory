CREATE TABLE IF NOT EXISTS product_analytics_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  gym_id INT NULL,
  user_role VARCHAR(32) NOT NULL DEFAULT 'unknown',
  page_path VARCHAR(255) NOT NULL,
  event_type ENUM('page_view', 'page_exit') NOT NULL,
  duration_seconds INT NULL,
  metadata_json LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_analytics_events_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_product_analytics_events_gym
    FOREIGN KEY (gym_id) REFERENCES gyms(id)
    ON DELETE SET NULL,
  KEY idx_product_analytics_events_created (created_at),
  KEY idx_product_analytics_events_path (page_path),
  KEY idx_product_analytics_events_user (user_id),
  KEY idx_product_analytics_events_type (event_type)
);
