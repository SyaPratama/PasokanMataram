-- Migration 009: Ekosistem Supplier Bahan Pangan Lokal DIY, Etalase Multi-SKU, & Review B2B Dua Arah
-- Memperluas PasokMataram dari sekadar petani menjadi One-Stop B2B Food Supply (Unggas, Daging, Susu, Bumbu, Sayur)

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supplier_category_enum') THEN
        CREATE TYPE supplier_category_enum AS ENUM (
            'FARMER_GROUP',          -- Kelompok Tani / Gapoktan (Hortikultura & Pangan Pokok)
            'LIVESTOCK_FARM',        -- Peternakan Unggas & Telur (Sleman Utara & Kulon Progo)
            'MEAT_PROCESSOR',        -- Supplier Daging Sapi Segar & RPH (Giwangan & Segoroyoso)
            'DAIRY_COOPERATIVE',     -- Koperasi Susu Perah & Olahan Keju (Kaliurang & Pakem)
            'FOOD_DISTRIBUTOR',      -- Distributor Sembako & Bahan Pokok Terakreditasi
            'ARTISANAL_PRODUCER'     -- Pengrajin Bumbu & Makanan Tradisional (Gula Semut, Tempe/Tahu Krapyak)
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fulfillment_model_enum') THEN
        CREATE TYPE fulfillment_model_enum AS ENUM (
            'POOL_GROUP_BUYING',     -- Model Pool / Panen Bersama (MOQ lelang Gapoktan)
            'DIRECT_DISPATCH',       -- Kirim Langsung Chiller Van Supplier ke Resto (Ready Stock)
            'CROSS_DOCK'             -- Transit Subuh di Sentra Hub PasokMataram Bantul
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'b2b_review_direction_enum') THEN
        CREATE TYPE b2b_review_direction_enum AS ENUM (
            'BUYER_TO_SUPPLIER',     -- Pembeli HoReKa mereview Supplier & Mutu Bahan
            'SUPPLIER_TO_BUYER'      -- Supplier mereview Pembeli HoReKa (Ketepatan Pembayaran & Penerimaan)
        );
    END IF;
END $$;

-- 1. Profil Tambahan Supplier Pangan Lokal
CREATE TABLE IF NOT EXISTS supplier_profiles (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    category supplier_category_enum NOT NULL DEFAULT 'FOOD_DISTRIBUTOR',
    fulfillment_model fulfillment_model_enum NOT NULL DEFAULT 'DIRECT_DISPATCH',
    has_cold_chain BOOLEAN NOT NULL DEFAULT FALSE,
    certifications JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. [{"name": "Halal BPJPH", "number": "..."}, {"name": "NKV", "grade": "Level 1"}]
    rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    review_count INT NOT NULL DEFAULT 0,
    bio TEXT,
    minimum_order_rp NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Etalase Produk / Dagangan Multi-SKU Supplier
CREATE TABLE IF NOT EXISTS supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    sku_code VARCHAR(50) NOT NULL,
    unit VARCHAR(30) NOT NULL DEFAULT 'kg',
    price NUMERIC(14, 2) NOT NULL,
    min_order_qty NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
    stock_available NUMERIC(10, 2) NOT NULL DEFAULT 100.0,
    lead_time_hours INT NOT NULL DEFAULT 12,
    is_ready_stock BOOLEAN NOT NULL DEFAULT TRUE,
    fulfillment_type fulfillment_model_enum NOT NULL DEFAULT 'DIRECT_DISPATCH',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_supplier_sku UNIQUE (supplier_tenant_id, sku_code)
);

-- 3. Review & Reputasi Bisnis Dua Arah (Shopee-like B2B Trust Network)
CREATE TABLE IF NOT EXISTS b2b_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    to_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    direction b2b_review_direction_enum NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    quality_score INT CHECK (quality_score BETWEEN 1 AND 5),
    punctuality_score INT CHECK (punctuality_score BETWEEN 1 AND 5),
    payment_speed_score INT CHECK (payment_speed_score BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    verified_order_reference VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks Kinerja
CREATE INDEX IF NOT EXISTS idx_supplier_products_category ON supplier_products (category, is_active);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON supplier_products (supplier_tenant_id);
CREATE INDEX IF NOT EXISTS idx_b2b_reviews_to_tenant ON b2b_reviews (to_tenant_id, direction);
CREATE INDEX IF NOT EXISTS idx_b2b_reviews_from_tenant ON b2b_reviews (from_tenant_id);
