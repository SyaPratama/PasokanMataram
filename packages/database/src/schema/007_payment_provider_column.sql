-- Migration: Add provider column to payment_invoices
-- Description: Tracks which payment gateway processed each invoice
-- Date: 2026-11-04

ALTER TABLE payment_invoices
  ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'solosmartpay'
    COMMENT 'Payment gateway provider: solosmartpay | xendit | duitku | midtrans'
    AFTER currency,
  ADD INDEX idx_provider (provider);
