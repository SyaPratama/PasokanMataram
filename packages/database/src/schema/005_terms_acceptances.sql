-- Migration: Terms Acceptances Table
-- Description: Track user acceptance of Terms & Conditions and Privacy Policy
-- Date: 2026-11-03

CREATE TABLE IF NOT EXISTS terms_acceptances (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  document_type VARCHAR(20) NOT NULL,
  document_version VARCHAR(20) NOT NULL,
  accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  INDEX idx_user_document (user_id, document_type),
  INDEX idx_accepted_at (accepted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
