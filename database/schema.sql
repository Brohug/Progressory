CREATE TABLE gyms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('owner', 'admin', 'coach', 'member') NOT NULL DEFAULT 'coach',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE
);

CREATE TABLE programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_programs_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_programs_gym_name
        UNIQUE (gym_id, name)
);

CREATE TABLE curriculum_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    program_id INT NULL,
    parent_topic_id INT NULL,
    title VARCHAR(150) NOT NULL,
    topic_type ENUM(
        'position',
        'technique',
        'concept',
        'submission',
        'escape',
        'takedown',
        'drill_theme'
    ) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_curriculum_topics_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_curriculum_topics_program
        FOREIGN KEY (program_id) REFERENCES programs(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_curriculum_topics_parent
        FOREIGN KEY (parent_topic_id) REFERENCES curriculum_topics(id)
        ON DELETE SET NULL
);

CREATE TABLE training_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_training_methods_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_training_methods_gym_name
        UNIQUE (gym_id, name)
);

CREATE TABLE training_scenarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    program_id INT NULL,
    training_method_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    starting_position_topic_id INT NULL,
    top_objective VARCHAR(255) NULL,
    bottom_objective VARCHAR(255) NULL,
    constraints_text TEXT NULL,
    round_duration_seconds INT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_training_scenarios_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_training_scenarios_program
        FOREIGN KEY (program_id) REFERENCES programs(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_training_scenarios_method
        FOREIGN KEY (training_method_id) REFERENCES training_methods(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_training_scenarios_starting_topic
        FOREIGN KEY (starting_position_topic_id) REFERENCES curriculum_topics(id)
        ON DELETE SET NULL
);

CREATE TABLE planned_classes (
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

CREATE TABLE planned_class_topics (
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

CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    program_id INT NOT NULL,
    title VARCHAR(150) NULL,
    class_date DATE NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    head_coach_user_id INT NOT NULL,
    logged_by_user_id INT NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_classes_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_classes_program
        FOREIGN KEY (program_id) REFERENCES programs(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_classes_head_coach
        FOREIGN KEY (head_coach_user_id) REFERENCES users(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_classes_logged_by
        FOREIGN KEY (logged_by_user_id) REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE TABLE class_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    curriculum_topic_id INT NOT NULL,
    coverage_type ENUM('taught', 'reviewed') NOT NULL DEFAULT 'taught',
    focus_level ENUM('focus', 'secondary', 'review') NOT NULL DEFAULT 'focus',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_topics_class
        FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_class_topics_topic
        FOREIGN KEY (curriculum_topic_id) REFERENCES curriculum_topics(id)
        ON DELETE CASCADE
);

CREATE TABLE class_training_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    training_method_id INT NOT NULL,
    training_scenario_id INT NULL,
    curriculum_topic_id INT NULL,
    segment_title VARCHAR(150) NULL,
    segment_order INT NOT NULL DEFAULT 1,
    duration_minutes INT NULL,
    constraints_text TEXT NULL,
    win_condition_top VARCHAR(255) NULL,
    win_condition_bottom VARCHAR(255) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_training_entries_class
        FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_class_training_entries_method
        FOREIGN KEY (training_method_id) REFERENCES training_methods(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_class_training_entries_scenario
        FOREIGN KEY (training_scenario_id) REFERENCES training_scenarios(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_class_training_entries_topic
        FOREIGN KEY (curriculum_topic_id) REFERENCES curriculum_topics(id)
        ON DELETE SET NULL
);

CREATE TABLE library_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    program_id INT NULL,
    curriculum_topic_id INT NULL,
    created_by_user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    entry_type ENUM('technique', 'concept', 'drill', 'cla_game', 'video_note') NOT NULL,
    description TEXT NULL,
    video_url TEXT NULL,
    visibility ENUM('coach_only', 'member_visible') NOT NULL DEFAULT 'coach_only',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_library_entries_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_library_entries_program
        FOREIGN KEY (program_id) REFERENCES programs(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_library_entries_topic
        FOREIGN KEY (curriculum_topic_id) REFERENCES curriculum_topics(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_library_entries_user
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
        ON DELETE RESTRICT
);

CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    user_id INT NULL,
    program_id INT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NULL,
    belt_rank VARCHAR(50) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_members_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_members_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_members_program
        FOREIGN KEY (program_id) REFERENCES programs(id)
        ON DELETE SET NULL,
    CONSTRAINT uq_members_user
        UNIQUE (user_id)
);

CREATE TABLE class_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    member_id INT NOT NULL,
    attendance_status ENUM('present', 'absent', 'excused') NOT NULL DEFAULT 'present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_class_members_class
        FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_class_members_member
        FOREIGN KEY (member_id) REFERENCES members(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_class_members_unique
        UNIQUE (class_id, member_id)
);

CREATE TABLE member_topic_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    curriculum_topic_id INT NOT NULL,
    status ENUM('not_started', 'introduced', 'developing', 'competent') NOT NULL DEFAULT 'introduced',
    last_reviewed_at TIMESTAMP NULL,
    notes TEXT NULL,
    updated_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_member_topic_progress_member
        FOREIGN KEY (member_id) REFERENCES members(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_member_topic_progress_topic
        FOREIGN KEY (curriculum_topic_id) REFERENCES curriculum_topics(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_member_topic_progress_updated_by
        FOREIGN KEY (updated_by_user_id) REFERENCES users(id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_member_topic_progress_unique
        UNIQUE (member_id, curriculum_topic_id)
);
