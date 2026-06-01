CREATE TABLE IF NOT EXISTS gym_check_in_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gym_id INT NOT NULL,
  user_id INT NULL,
  member_id INT NULL,
  matched_class_id INT NULL,
  matched_planned_class_id INT NULL,
  checked_in_role VARCHAR(32) NOT NULL DEFAULT 'member',
  source ENUM('public_qr', 'staff_tool') NOT NULL DEFAULT 'public_qr',
  identifier_email VARCHAR(150) NULL,
  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gym_check_in_events_gym
    FOREIGN KEY (gym_id) REFERENCES gyms(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_gym_check_in_events_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_gym_check_in_events_member
    FOREIGN KEY (member_id) REFERENCES members(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_gym_check_in_events_class
    FOREIGN KEY (matched_class_id) REFERENCES classes(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_gym_check_in_events_planned_class
    FOREIGN KEY (matched_planned_class_id) REFERENCES planned_classes(id)
    ON DELETE SET NULL,
  KEY idx_gym_check_in_events_gym_created (gym_id, created_at),
  KEY idx_gym_check_in_events_user (user_id),
  KEY idx_gym_check_in_events_member (member_id)
);
