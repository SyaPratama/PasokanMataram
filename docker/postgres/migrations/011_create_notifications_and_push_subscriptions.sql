-- Migration 011: Skema Normalisasi Notifikasi, Langganan Web Push PWA, dan Server-Sent Events (SSE)
-- Mematuhi Bentuk Normal Ketiga (3NF), Isolasi Multi-Tenant RLS, dan Doktrin Konstitusi PasokMataram

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_category_enum') THEN
        CREATE TYPE notification_category_enum AS ENUM (
            'ORDER',
            'POOLING',
            'PAYMENT',
            'QC_DISPUTE',
            'KYB_STATUS',
            'SYSTEM'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority_enum') THEN
        CREATE TYPE notification_priority_enum AS ENUM (
            'LOW',
            'NORMAL',
            'HIGH',
            'URGENT'
        );
    END IF;
END $$;

-- 1. Tabel Notifikasi Terpusat (3NF Normalized Notifications Table)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category notification_category_enum NOT NULL DEFAULT 'SYSTEM',
    priority notification_priority_enum NOT NULL DEFAULT 'NORMAL',
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    action_url VARCHAR(255),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Langganan Web Push PWA (W3C Push API & VAPID Subscriptions)
CREATE TABLE IF NOT EXISTS user_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Log Pengiriman Notifikasi (Audit Delivery Log: SSE Stream vs Web Push)
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL,
    delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'DELIVERED',
    failure_reason TEXT
);

-- Indeks Performa Kueri
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_unread
    ON notifications(tenant_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
    ON notifications(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_sub_tenant_active
    ON user_push_subscriptions(tenant_id, is_active);

-- Kebijakan Isolasi Row-Level Security (RLS) PostgreSQL 16
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_tenant_isolation'
    ) THEN
        CREATE POLICY notifications_tenant_isolation ON notifications
            USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_push_subscriptions' AND policyname = 'push_sub_tenant_isolation'
    ) THEN
        CREATE POLICY push_sub_tenant_isolation ON user_push_subscriptions
            USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notification_delivery_logs' AND policyname = 'delivery_logs_tenant_isolation'
    ) THEN
        CREATE POLICY delivery_logs_tenant_isolation ON notification_delivery_logs
            USING (
                notification_id IN (
                    SELECT id FROM notifications
                    WHERE tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
                )
            );
    END IF;
END $$;
