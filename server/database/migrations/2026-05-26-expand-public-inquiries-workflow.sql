SET @has_linked_gym_id := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'public_inquiries'
    AND COLUMN_NAME = 'linked_gym_id'
);
SET @sql := IF(
  @has_linked_gym_id = 0,
  "ALTER TABLE public_inquiries ADD COLUMN linked_gym_id INT NULL AFTER status",
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_linked_owner_user_id := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'public_inquiries'
    AND COLUMN_NAME = 'linked_owner_user_id'
);
SET @sql := IF(
  @has_linked_owner_user_id = 0,
  "ALTER TABLE public_inquiries ADD COLUMN linked_owner_user_id INT NULL AFTER linked_gym_id",
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_owner_contacted_at := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'public_inquiries'
    AND COLUMN_NAME = 'owner_contacted_at'
);
SET @sql := IF(
  @has_owner_contacted_at = 0,
  "ALTER TABLE public_inquiries ADD COLUMN owner_contacted_at DATETIME NULL AFTER linked_owner_user_id",
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_provisioned_at := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'public_inquiries'
    AND COLUMN_NAME = 'provisioned_at'
);
SET @sql := IF(
  @has_provisioned_at = 0,
  "ALTER TABLE public_inquiries ADD COLUMN provisioned_at DATETIME NULL AFTER owner_contacted_at",
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_converted_at := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'public_inquiries'
    AND COLUMN_NAME = 'converted_at'
);
SET @sql := IF(
  @has_converted_at = 0,
  "ALTER TABLE public_inquiries ADD COLUMN converted_at DATETIME NULL AFTER provisioned_at",
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_internal_notes := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'public_inquiries'
    AND COLUMN_NAME = 'internal_notes'
);
SET @sql := IF(
  @has_internal_notes = 0,
  "ALTER TABLE public_inquiries ADD COLUMN internal_notes TEXT NULL AFTER converted_at",
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_idx_linked_gym_id := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'public_inquiries'
    AND INDEX_NAME = 'idx_public_inquiries_linked_gym_id'
);
SET @sql := IF(
  @has_idx_linked_gym_id = 0,
  "ALTER TABLE public_inquiries ADD INDEX idx_public_inquiries_linked_gym_id (linked_gym_id)",
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_idx_linked_owner_user_id := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'public_inquiries'
    AND INDEX_NAME = 'idx_public_inquiries_linked_owner_user_id'
);
SET @sql := IF(
  @has_idx_linked_owner_user_id = 0,
  "ALTER TABLE public_inquiries ADD INDEX idx_public_inquiries_linked_owner_user_id (linked_owner_user_id)",
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
