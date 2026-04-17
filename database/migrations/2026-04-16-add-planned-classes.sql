-- Planned Classes / Curriculum Calendar v1
-- Safe additive migration only.
--
-- Notes:
-- 1. This migration creates only new tables.
-- 2. It does not alter or rewrite any existing data.
-- 3. completed_class_id is intentionally left as a nullable INT for v1 so
--    rollout risk stays lower while the feature settles in real use.
-- 4. A later follow-up migration can add a foreign key on completed_class_id
--    after the feature is proven stable in production.

CREATE TABLE IF NOT EXISTS planned_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    program_id INT NOT NULL,
    training_scenario_id INT NULL,
    title VARCHAR(150) NULL,
    class_date DATE NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    head_coach_user_id INT NOT NULL,
    status ENUM('planned', 'completed') NOT NULL DEFAULT 'planned',
    notes TEXT NULL,
    completed_class_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_planned_classes_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_planned_classes_program
        FOREIGN KEY (program_id) REFERENCES programs(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_planned_classes_scenario
        FOREIGN KEY (training_scenario_id) REFERENCES training_scenarios(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_planned_classes_head_coach
        FOREIGN KEY (head_coach_user_id) REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS planned_class_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    planned_class_id INT NOT NULL,
    curriculum_topic_id INT NOT NULL,
    focus_level ENUM('focus', 'secondary', 'review') NOT NULL DEFAULT 'focus',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_planned_class_topics_planned_class
        FOREIGN KEY (planned_class_id) REFERENCES planned_classes(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_planned_class_topics_topic
        FOREIGN KEY (curriculum_topic_id) REFERENCES curriculum_topics(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_planned_class_topics_unique
        UNIQUE (planned_class_id, curriculum_topic_id)
);
