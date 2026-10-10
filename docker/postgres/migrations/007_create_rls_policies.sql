-- Migration 007: Kebijakan Keamanan Multi-Tenant (PostgreSQL Row-Level Security)
-- Memastikan isolasi data 100% antar organisasi bisnis di tingkat engine basis data

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyb_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_outlets ENABLE ROW LEVEL SECURITY;

-- 1. Kebijakan RLS untuk Tenants
DROP POLICY IF EXISTS tenant_isolation_tenants ON tenants;
CREATE POLICY tenant_isolation_tenants ON tenants
    USING (
        id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
        OR current_setting('app.is_super_admin', true) = 'true'
    );

-- 2. Kebijakan RLS untuk Users
DROP POLICY IF EXISTS tenant_isolation_users ON users;
CREATE POLICY tenant_isolation_users ON users
    USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
        OR current_setting('app.is_super_admin', true) = 'true'
    );

-- 3. Kebijakan RLS untuk KYB Documents
DROP POLICY IF EXISTS tenant_isolation_kyb_docs ON kyb_documents;
CREATE POLICY tenant_isolation_kyb_docs ON kyb_documents
    USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
        OR current_setting('app.is_super_admin', true) = 'true'
    );

-- 4. Kebijakan RLS untuk Business Outlets
DROP POLICY IF EXISTS tenant_isolation_outlets ON business_outlets;
CREATE POLICY tenant_isolation_outlets ON business_outlets
    USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
        OR current_setting('app.is_super_admin', true) = 'true'
    );
