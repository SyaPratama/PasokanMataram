-- Migration 010: Skema Alur Ekosistem Bisnis PasokMataram
-- Mengintegrasikan Kampanye Pooling, Reservasi Kuota MTV Rp 500k, Verifikasi Timbangan Fisik Hub, dan Settlement Escrow BPD DIY

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'temperature_zone_enum') THEN
        CREATE TYPE temperature_zone_enum AS ENUM (
            'FROZEN',
            'CHILLED',
            'AMBIENT_VENTILATED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commodity_category_enum') THEN
        CREATE TYPE commodity_category_enum AS ENUM (
            'MEAT',
            'MILK',
            'PERISHABLE_VEGETABLE',
            'GRAIN',
            'PROCESSED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status_enum') THEN
        CREATE TYPE reservation_status_enum AS ENUM (
            'PENDING_PAYMENT',
            'PAID',
            'ALLOCATED',
            'RECEIVED',
            'CANCELLED',
            'DISPUTED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weighing_tolerance_status_enum') THEN
        CREATE TYPE weighing_tolerance_status_enum AS ENUM (
            'WITHIN_TOLERANCE',
            'ACCEPTABLE_DEFICIT',
            'EXCESS_DEFICIT',
            'SURPLUS'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'settlement_status_enum') THEN
        CREATE TYPE settlement_status_enum AS ENUM (
            'ESCROW_LOCKED',
            'READY_FOR_DISBURSEMENT',
            'DISBURSED',
            'HELD_DISPUTE',
            'REFUNDED'
        );
    END IF;
END $$;

-- 1. Kampanye Pooling Komoditas
CREATE TABLE IF NOT EXISTS pooling_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    commodity_name VARCHAR(150) NOT NULL,
    commodity_category commodity_category_enum NOT NULL,
    temperature_zone temperature_zone_enum NOT NULL DEFAULT 'AMBIENT_VENTILATED',
    target_quota_kg NUMERIC(12, 2) NOT NULL,
    allocated_quota_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    price_per_kg NUMERIC(14, 2) NOT NULL,
    min_order_kg NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Reservasi Kuota Pooling (Dengan Batas MTV Rp 500.000)
CREATE TABLE IF NOT EXISTS pool_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES pooling_campaigns(id) ON DELETE CASCADE,
    buyer_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    quantity_kg NUMERIC(10, 2) NOT NULL,
    price_per_kg NUMERIC(14, 2) NOT NULL,
    total_amount_rp NUMERIC(14, 2) NOT NULL,
    status reservation_status_enum NOT NULL DEFAULT 'PENDING_PAYMENT',
    delivery_address TEXT NOT NULL,
    va_number VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_minimum_transaction_value CHECK (total_amount_rp >= 500000.00),
    CONSTRAINT chk_positive_quantity CHECK (quantity_kg > 0)
);

-- 3. Log Verifikasi Timbangan Fisik Hub
CREATE TABLE IF NOT EXISTS weighing_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES pool_reservations(id) ON DELETE CASCADE,
    hub_id VARCHAR(50) NOT NULL,
    operator_id UUID NOT NULL REFERENCES users(id),
    commodity_category commodity_category_enum NOT NULL,
    temperature_zone temperature_zone_enum NOT NULL,
    measured_temp_celsius NUMERIC(5, 2) NOT NULL,
    manifest_weight_kg NUMERIC(10, 2) NOT NULL,
    actual_weight_kg NUMERIC(10, 2) NOT NULL,
    weight_difference_kg NUMERIC(10, 2) NOT NULL,
    shrinkage_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    tolerance_status weighing_tolerance_status_enum NOT NULL,
    is_temperature_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    scale_device_id VARCHAR(100) NOT NULL,
    notes TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Settlement Escrow Rekening Bersama BPD DIY
CREATE TABLE IF NOT EXISTS escrow_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL UNIQUE REFERENCES pool_reservations(id) ON DELETE CASCADE,
    supplier_tenant_id UUID NOT NULL REFERENCES tenants(id),
    buyer_tenant_id UUID NOT NULL REFERENCES tenants(id),
    gross_amount_rp NUMERIC(14, 2) NOT NULL,
    platform_fee_rp NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    net_disbursement_rp NUMERIC(14, 2) NOT NULL,
    status settlement_status_enum NOT NULL DEFAULT 'ESCROW_LOCKED',
    scheduled_disbursement_at TIMESTAMPTZ NOT NULL,
    disbursed_at TIMESTAMPTZ,
    dispute_reason TEXT,
    dispute_refund_rp NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Telemetri Corong Konversi Ekosistem
CREATE TABLE IF NOT EXISTS funnel_telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step VARCHAR(50) NOT NULL,
    campaign_id UUID NOT NULL REFERENCES pooling_campaigns(id) ON DELETE CASCADE,
    buyer_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks Kinerja
CREATE INDEX IF NOT EXISTS idx_pooling_campaigns_supplier ON pooling_campaigns(supplier_tenant_id);
CREATE INDEX IF NOT EXISTS idx_pool_reservations_campaign ON pool_reservations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_pool_reservations_buyer ON pool_reservations(buyer_tenant_id);
CREATE INDEX IF NOT EXISTS idx_weighing_verifications_reservation ON weighing_verifications(reservation_id);
CREATE INDEX IF NOT EXISTS idx_escrow_settlements_status ON escrow_settlements(status, scheduled_disbursement_at);

-- Kebijakan Keamanan Multi-Tenant (RLS)
ALTER TABLE pooling_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pooling_campaigns FORCE ROW LEVEL SECURITY;
ALTER TABLE pool_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_reservations FORCE ROW LEVEL SECURITY;
ALTER TABLE weighing_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE weighing_verifications FORCE ROW LEVEL SECURITY;
ALTER TABLE escrow_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_settlements FORCE ROW LEVEL SECURITY;
ALTER TABLE funnel_telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_telemetry_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS campaigns_tenant_isolation ON pooling_campaigns;
CREATE POLICY campaigns_tenant_isolation ON pooling_campaigns
    USING (
        supplier_tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
        OR current_setting('app.is_super_admin', true) = 'true'
        OR status = 'OPEN'
    );

DROP POLICY IF EXISTS reservations_tenant_isolation ON pool_reservations;
CREATE POLICY reservations_tenant_isolation ON pool_reservations
    USING (
        buyer_tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
        OR current_setting('app.is_super_admin', true) = 'true'
        OR EXISTS (
            SELECT 1 FROM pooling_campaigns pc
            WHERE pc.id = pool_reservations.campaign_id
            AND pc.supplier_tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
        )
    );

DROP POLICY IF EXISTS weighing_tenant_isolation ON weighing_verifications;
CREATE POLICY weighing_tenant_isolation ON weighing_verifications
    USING (
        current_setting('app.is_super_admin', true) = 'true'
        OR EXISTS (
            SELECT 1 FROM pool_reservations pr
            WHERE pr.id = weighing_verifications.reservation_id
            AND (
                pr.buyer_tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
                OR EXISTS (
                    SELECT 1 FROM pooling_campaigns pc
                    WHERE pc.id = pr.campaign_id
                    AND pc.supplier_tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
                )
            )
        )
    );

DROP POLICY IF EXISTS escrow_tenant_isolation ON escrow_settlements;
CREATE POLICY escrow_tenant_isolation ON escrow_settlements
    USING (
        buyer_tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
        OR supplier_tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
        OR current_setting('app.is_super_admin', true) = 'true'
    );

DROP POLICY IF EXISTS telemetry_tenant_isolation ON funnel_telemetry_events;
CREATE POLICY telemetry_tenant_isolation ON funnel_telemetry_events
    USING (
        buyer_tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
        OR current_setting('app.is_super_admin', true) = 'true'
        OR buyer_tenant_id IS NULL
    );
