-- Migration: Deprecate Escrow Settlements Table
-- Description: Add deprecated_at column to mark legacy escrow table
-- Date: 2026-11-03

CREATE TABLE IF NOT EXISTS escrow_settlements (
  id VARCHAR(36) PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE escrow_settlements 
ADD COLUMN IF NOT EXISTS deprecated_at DATETIME DEFAULT '2026-11-03 00:00:00';

ALTER TABLE escrow_settlements 
ADD COLUMN IF NOT EXISTS migration_note VARCHAR(255) DEFAULT 'Replaced by Solosmartpay direct payment';
