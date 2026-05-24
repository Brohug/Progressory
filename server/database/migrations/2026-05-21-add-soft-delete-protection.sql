-- Protect historical academy data by switching classes to archive semantics.
-- Existing topics, members, scenarios, and library entries already use is_active.
-- This migration adds missing archival support to classes and class-log subrecords.

SET @classes_has_archived_at := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'classes'
    AND COLUMN_NAME = 'archived_at'
);
SET @classes_archived_at_sql := IF(
  @classes_has_archived_at = 0,
  "ALTER TABLE classes ADD COLUMN archived_at TIMESTAMP NULL AFTER notes",
  'SELECT 1'
);
PREPARE stmt FROM @classes_archived_at_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @class_topics_has_archived_at := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'class_topics'
    AND COLUMN_NAME = 'archived_at'
);
SET @class_topics_archived_at_sql := IF(
  @class_topics_has_archived_at = 0,
  "ALTER TABLE class_topics ADD COLUMN archived_at TIMESTAMP NULL AFTER notes",
  'SELECT 1'
);
PREPARE stmt FROM @class_topics_archived_at_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @class_training_entries_has_archived_at := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'class_training_entries'
    AND COLUMN_NAME = 'archived_at'
);
SET @class_training_entries_archived_at_sql := IF(
  @class_training_entries_has_archived_at = 0,
  "ALTER TABLE class_training_entries ADD COLUMN archived_at TIMESTAMP NULL AFTER notes",
  'SELECT 1'
);
PREPARE stmt FROM @class_training_entries_archived_at_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @class_members_has_archived_at := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'class_members'
    AND COLUMN_NAME = 'archived_at'
);
SET @class_members_archived_at_sql := IF(
  @class_members_has_archived_at = 0,
  "ALTER TABLE class_members ADD COLUMN archived_at TIMESTAMP NULL AFTER attendance_status",
  'SELECT 1'
);
PREPARE stmt FROM @class_members_archived_at_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
