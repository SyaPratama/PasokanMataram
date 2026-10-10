-- Migration 005: Tabel Business Outlets (3NF Compliant)
-- Cabang gerai fisik dan alamat pengantaran logistik pangan di wilayah DIY

CREATE TABLE IF NOT EXISTS business_outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    outlet_name VARCHAR(255) NOT NULL,
    street_address TEXT NOT NULL,
    regency diy_regency_enum NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    is_main_outlet BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
