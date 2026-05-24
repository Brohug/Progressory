-- Add class/planned topic progress defaults and persisted entry setup examples.
-- Safe additive migration only. No existing data is deleted or rewritten.

SET @class_topics_has_progress_status := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'class_topics'
    AND COLUMN_NAME = 'progress_status'
);
SET @class_topics_progress_sql := IF(
  @class_topics_has_progress_status = 0,
  "ALTER TABLE class_topics ADD COLUMN progress_status ENUM('not_started', 'introduced', 'developing', 'competent') NULL AFTER focus_level",
  'SELECT 1'
);
PREPARE stmt FROM @class_topics_progress_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @planned_class_topics_has_progress_status := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'planned_class_topics'
    AND COLUMN_NAME = 'progress_status'
);
SET @planned_class_topics_progress_sql := IF(
  @planned_class_topics_has_progress_status = 0,
  "ALTER TABLE planned_class_topics ADD COLUMN progress_status ENUM('not_started', 'introduced', 'developing', 'competent') NULL AFTER focus_level",
  'SELECT 1'
);
PREPARE stmt FROM @planned_class_topics_progress_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS entry_setup_examples (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gym_id INT NOT NULL,
  created_by_user_id INT NOT NULL,
  linked_family_title VARCHAR(255) NULL,
  title VARCHAR(255) NOT NULL,
  lane VARCHAR(50) NOT NULL,
  summary TEXT NULL,
  description TEXT NULL,
  setup_nodes_json LONGTEXT NULL,
  next_attacks_json LONGTEXT NULL,
  example_sequence_json LONGTEXT NULL,
  curriculum_search VARCHAR(255) NULL,
  tree_search VARCHAR(255) NULL,
  visibility ENUM('private', 'gym_shared') NOT NULL DEFAULT 'private',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_entry_setup_examples_gym
    FOREIGN KEY (gym_id) REFERENCES gyms(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_entry_setup_examples_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
    ON DELETE RESTRICT,
  INDEX idx_entry_setup_examples_gym_visibility (gym_id, visibility),
  INDEX idx_entry_setup_examples_creator (created_by_user_id)
);
