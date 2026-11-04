-- Migration: Add provider column to webhook_events
-- Description: Tracks which payment gateway sent each webhook
-- Date: 2026-11-04

ALTER TABLE webhook_events
  ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'solosmartpay'
    COMMENT 'Payment gateway that sent this webhook'
    AFTER event_type;
