CREATE TABLE IF NOT EXISTS public_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_type ENUM('demo', 'founder') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  gym_name VARCHAR(255) NOT NULL,
  demo_slot_start DATETIME NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_public_inquiries_demo_slot_start (demo_slot_start),
  KEY idx_public_inquiries_request_type (request_type),
  KEY idx_public_inquiries_status (status),
  KEY idx_public_inquiries_demo_slot_start (demo_slot_start)
);
