SET @db_name = DATABASE();

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'gym_subscriptions' AND COLUMN_NAME = 'founder_locked_rate'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE gym_subscriptions ADD COLUMN founder_locked_rate BOOLEAN NOT NULL DEFAULT FALSE AFTER stripe_subscription_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'gym_subscriptions' AND COLUMN_NAME = 'founder_started_at'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE gym_subscriptions ADD COLUMN founder_started_at DATETIME NULL AFTER founder_locked_rate',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'gym_subscriptions' AND COLUMN_NAME = 'current_period_start'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE gym_subscriptions ADD COLUMN current_period_start DATETIME NULL AFTER current_period_end',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS plan_limits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_code ENUM('founder', 'regular') NOT NULL,
  display_name VARCHAR(80) NOT NULL,
  max_coaches INT NOT NULL DEFAULT 0,
  max_active_members INT NOT NULL DEFAULT 0,
  max_library_items INT NOT NULL DEFAULT 0,
  max_external_video_links INT NOT NULL DEFAULT 0,
  max_direct_video_uploads INT NOT NULL DEFAULT 0,
  max_storage_mb INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_plan_limits_plan_code UNIQUE (plan_code)
);

INSERT INTO plan_limits
  (plan_code, display_name, max_coaches, max_active_members, max_library_items, max_external_video_links, max_direct_video_uploads, max_storage_mb)
VALUES
  ('founder', 'Founder Plan', 5, 200, 100, 100, 0, 0),
  ('regular', 'Standard Plan', 5, 200, 250, 250, 0, 0)
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  max_coaches = VALUES(max_coaches),
  max_active_members = VALUES(max_active_members),
  max_library_items = VALUES(max_library_items),
  max_external_video_links = VALUES(max_external_video_links),
  max_direct_video_uploads = VALUES(max_direct_video_uploads),
  max_storage_mb = VALUES(max_storage_mb);
