-- Migration: Deprecate Escrow Settlements Table
-- Description: Add deprecated_at column to mark legacy escrow table
-- Date: 2026-11-03

ALTER TABLE escrow_settlements 
ADD COLUMN IF NOT EXISTS deprecated_at DATETIME DEFAULT '2026-11-03 00:00:00';

ALTER TABLE escrow_settlements 
ADD COLUMN IF NOT EXISTS migration_note VARCHAR(255) DEFAULT 'Replaced by Solosmartpay direct payment';
