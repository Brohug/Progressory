SET @db_name = DATABASE();

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'can_upload_library_content'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE users ADD COLUMN can_upload_library_content BOOLEAN NOT NULL DEFAULT FALSE AFTER is_active',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'terms_accepted_at'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE users ADD COLUMN terms_accepted_at DATETIME NULL AFTER can_upload_library_content',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'privacy_accepted_at'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE users ADD COLUMN privacy_accepted_at DATETIME NULL AFTER terms_accepted_at',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'acceptable_use_accepted_at'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE users ADD COLUMN acceptable_use_accepted_at DATETIME NULL AFTER privacy_accepted_at',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'child_safety_accepted_at'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE users ADD COLUMN child_safety_accepted_at DATETIME NULL AFTER acceptable_use_accepted_at',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'accepted_policy_version'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE users ADD COLUMN accepted_policy_version VARCHAR(32) NULL AFTER child_safety_accepted_at',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE users
SET can_upload_library_content = TRUE
WHERE role IN ('owner', 'admin');

ALTER TABLE library_entries
  MODIFY COLUMN visibility ENUM('coach_only', 'member_visible', 'members', 'parents', 'members_and_parents') NOT NULL DEFAULT 'coach_only';

UPDATE library_entries
SET visibility = 'members'
WHERE visibility = 'member_visible';

ALTER TABLE library_entries
  MODIFY COLUMN visibility ENUM('coach_only', 'members', 'parents', 'members_and_parents') NOT NULL DEFAULT 'coach_only';

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'library_entries' AND COLUMN_NAME = 'original_filename'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE library_entries ADD COLUMN original_filename VARCHAR(255) NULL AFTER video_url',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'library_entries' AND COLUMN_NAME = 'mime_type'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE library_entries ADD COLUMN mime_type VARCHAR(100) NULL AFTER original_filename',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'library_entries' AND COLUMN_NAME = 'file_size'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE library_entries ADD COLUMN file_size BIGINT NULL AFTER mime_type',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'library_entries' AND COLUMN_NAME = 'content_safety_confirmed'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE library_entries ADD COLUMN content_safety_confirmed BOOLEAN NOT NULL DEFAULT FALSE AFTER file_size',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'library_entries' AND COLUMN_NAME = 'content_status'
);
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE library_entries ADD COLUMN content_status ENUM(''active'', ''hidden'', ''deleted'') NOT NULL DEFAULT ''active'' AFTER content_safety_confirmed',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE library_entries
SET content_safety_confirmed = TRUE,
    content_status = CASE
      WHEN is_active = TRUE THEN 'active'
      ELSE 'deleted'
    END
WHERE content_status = 'active' OR content_status IS NULL OR content_safety_confirmed = FALSE;

CREATE TABLE IF NOT EXISTS content_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_id INT NOT NULL,
  gym_id INT NOT NULL,
  reported_by_user_id INT NOT NULL,
  reason ENUM(
    'inappropriate_content',
    'minor_safety_concern',
    'copyright_or_permission_issue',
    'harassment_or_abuse',
    'other'
  ) NOT NULL,
  description TEXT NULL,
  status ENUM('open', 'reviewed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  reviewed_by_user_id INT NULL,
  CONSTRAINT fk_content_reports_content
    FOREIGN KEY (content_id) REFERENCES library_entries(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_content_reports_gym
    FOREIGN KEY (gym_id) REFERENCES gyms(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_content_reports_reported_by
    FOREIGN KEY (reported_by_user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_content_reports_reviewed_by
    FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  KEY idx_content_reports_gym_status (gym_id, status),
  KEY idx_content_reports_content (content_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gym_id INT NULL,
  user_id INT NULL,
  event_type VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64) NULL,
  entity_id INT NULL,
  metadata_json LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_gym
    FOREIGN KEY (gym_id) REFERENCES gyms(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  KEY idx_audit_logs_gym_event (gym_id, event_type),
  KEY idx_audit_logs_user_event (user_id, event_type)
);
