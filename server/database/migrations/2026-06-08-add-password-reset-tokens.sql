CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  gym_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  request_ip VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_password_reset_user_active (user_id, used_at, expires_at),
  INDEX idx_password_reset_hash (token_hash),
  CONSTRAINT fk_password_reset_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_password_reset_gym
    FOREIGN KEY (gym_id) REFERENCES gyms(id)
    ON DELETE CASCADE
);
