-- Migration 002: Tabel Tenants (3NF Compliant)
-- Batas organisasi bisnis (HoReKa / Gapoktan) pemegang hak hukum dan kepatuhan KYB

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    tenant_type tenant_type_enum NOT NULL,
    regency diy_regency_enum NOT NULL,
    kyb_status kyb_status_enum NOT NULL DEFAULT 'UNVERIFIED',
    rejection_reason TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
