-- Migration: Payment Invoices Table
-- Description: Solosmartpay invoice tracking with multi-channel support (QRIS, VA, e-wallet)
-- Date: 2026-11-03

CREATE TABLE IF NOT EXISTS payment_invoices (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  reference VARCHAR(255) NOT NULL UNIQUE,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  invoice_url TEXT,
  qr_code_url TEXT,
  virtual_account_number VARCHAR(50),
  expires_at DATETIME NOT NULL,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant_reference (tenant_id, reference),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
