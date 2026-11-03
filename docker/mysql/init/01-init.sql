-- MySQL initialization script for PasokMataram
-- Executed on container first startup

-- Create database if not exists (redundant but safe)
CREATE DATABASE IF NOT EXISTS pasokmataram_local
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Grant privileges to user
GRANT ALL PRIVILEGES ON pasokmataram_local.* TO 'pasok_user'@'%';
GRANT ALL PRIVILEGES ON pasokmataram_local.* TO 'root'@'%';
FLUSH PRIVILEGES;

-- Log successful initialization
SELECT 'MySQL database initialized successfully' AS status;
