ALTER TABLE users
  MODIFY COLUMN role ENUM('owner', 'admin', 'coach', 'member') NOT NULL DEFAULT 'coach';

ALTER TABLE members
  ADD COLUMN user_id INT NULL AFTER gym_id,
  ADD CONSTRAINT fk_members_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT uq_members_user
    UNIQUE (user_id);
