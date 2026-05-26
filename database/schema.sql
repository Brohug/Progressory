CREATE TABLE gyms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    is_platform_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    platform_suspended_at DATETIME NULL,
    platform_suspension_reason TEXT NULL,
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
    progress_status ENUM('not_started', 'introduced', 'developing', 'competent') NULL,
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
    archived_at TIMESTAMP NULL,
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
    progress_status ENUM('not_started', 'introduced', 'developing', 'competent') NULL,
    notes TEXT NULL,
    archived_at TIMESTAMP NULL,
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
    archived_at TIMESTAMP NULL,
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
    archived_at TIMESTAMP NULL,
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

CREATE TABLE member_access_invites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    user_id INT NOT NULL,
    member_id INT NOT NULL,
    created_by_user_id INT NOT NULL,
    invite_type ENUM('activation', 'reset_password') NOT NULL DEFAULT 'activation',
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_member_access_invites_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_member_access_invites_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_member_access_invites_member
        FOREIGN KEY (member_id) REFERENCES members(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_member_access_invites_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_member_access_invites_token_hash
        UNIQUE (token_hash)
);

CREATE TABLE staff_access_invites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    user_id INT NOT NULL,
    created_by_user_id INT NOT NULL,
    invite_type ENUM('activation', 'reset_password') NOT NULL DEFAULT 'activation',
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_access_invites_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_staff_access_invites_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_staff_access_invites_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_staff_access_invites_token_hash
        UNIQUE (token_hash)
);

CREATE TABLE gym_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gym_id INT NOT NULL,
    stripe_customer_id VARCHAR(255) NULL,
    stripe_subscription_id VARCHAR(255) NULL,
    plan_code VARCHAR(50) NOT NULL DEFAULT 'none',
    billing_status VARCHAR(50) NOT NULL DEFAULT 'none',
    price_id VARCHAR(255) NULL,
    current_period_end DATETIME NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    trial_ends_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_gym_subscriptions_gym
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_gym_subscriptions_gym
        UNIQUE (gym_id),
    CONSTRAINT uq_gym_subscriptions_customer
        UNIQUE (stripe_customer_id),
    CONSTRAINT uq_gym_subscriptions_subscription
        UNIQUE (stripe_subscription_id)
);

CREATE TABLE billing_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stripe_event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(150) NOT NULL,
    processed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_events_stripe_event
        UNIQUE (stripe_event_id)
);

CREATE TABLE entry_setup_examples (
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

CREATE TABLE public_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_type ENUM('demo', 'founder') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    gym_name VARCHAR(255) NOT NULL,
    demo_slot_start DATETIME NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'new',
    linked_gym_id INT NULL,
    linked_owner_user_id INT NULL,
    owner_contacted_at DATETIME NULL,
    provisioned_at DATETIME NULL,
    converted_at DATETIME NULL,
    internal_notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_public_inquiries_demo_slot_start (demo_slot_start),
    KEY idx_public_inquiries_request_type (request_type),
    KEY idx_public_inquiries_status (status),
    KEY idx_public_inquiries_demo_slot_start (demo_slot_start),
    KEY idx_public_inquiries_linked_gym_id (linked_gym_id),
    KEY idx_public_inquiries_linked_owner_user_id (linked_owner_user_id)
);
