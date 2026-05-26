ALTER TABLE gyms
  ADD COLUMN is_platform_suspended BOOLEAN NOT NULL DEFAULT FALSE AFTER slug,
  ADD COLUMN platform_suspended_at DATETIME NULL AFTER is_platform_suspended,
  ADD COLUMN platform_suspension_reason TEXT NULL AFTER platform_suspended_at;
