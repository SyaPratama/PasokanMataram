-- Migration: Webhook Events Table
-- Description: Idempotency tracking for Solosmartpay webhook callbacks
-- Date: 2026-11-03

CREATE TABLE IF NOT EXISTS webhook_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(50) NOT NULL,
  payload TEXT NOT NULL,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_id (event_id),
  INDEX idx_event_type (event_type),
  INDEX idx_processed_at (processed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
