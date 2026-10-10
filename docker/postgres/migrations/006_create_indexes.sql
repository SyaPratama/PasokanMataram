-- Migration 006: Indeks Teroptimasi (SQL Index Optimization Mandate)
-- Menghilangkan Full Table Scan pada operasi berpaginasi, filtering, dan RLS

-- 1. Indeks Komposit Partisi Tenant & Foreign Keys
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users (tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_kyb_docs_tenant_status ON kyb_documents (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_outlets_tenant_regency ON business_outlets (tenant_id, regency);

-- 2. Partial Index untuk Antrean Audit Admin (High Performance)
CREATE INDEX IF NOT EXISTS idx_tenants_audit_pending ON tenants (created_at) 
  WHERE kyb_status = 'PENDING_VERIFICATION';

-- 3. Unique Index untuk Pencegahan Duplikasi NIB Sah yang Telah Diverifikasi
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_verified_nib ON kyb_documents (document_number) 
  WHERE document_type = 'NIB' AND status = 'VERIFIED';
