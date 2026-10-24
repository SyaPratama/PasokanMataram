-- Migration 008: Tabel Prakiraan Harga Komoditas Pangan ML & Data Terbuka DIY
-- Mematuhi Prinsip VII (Optimasi SQL & Paginasi) dan Prinsip I (FOSS Mandiri)

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commodity_category_enum') THEN
        CREATE TYPE commodity_category_enum AS ENUM ('Hortikultura', 'Pangan Pokok', 'Perkebunan');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_source_enum') THEN
        CREATE TYPE price_source_enum AS ENUM ('BAPANAS', 'PIHPS', 'PASAR_LELANG', 'INTERNAL_ESCROW');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'forecast_trend_enum') THEN
        CREATE TYPE forecast_trend_enum AS ENUM ('UP', 'DOWN', 'STABLE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recommended_action_enum') THEN
        CREATE TYPE recommended_action_enum AS ENUM ('BELI_SEKARANG', 'TUNGGU_PANEN_RAYA', 'KUNCI_KONTRAK');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weather_risk_level_enum') THEN
        CREATE TYPE weather_risk_level_enum AS ENUM ('RENDAH', 'SEDANG', 'TINGGI');
    END IF;
END $$;

-- 1. Master Komoditas Pertanian & Pangan DIY
CREATE TABLE IF NOT EXISTS commodities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category commodity_category_enum NOT NULL,
    origin_region VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Raw Market Price Log (Time-Series Harian Berbagai Sumber)
CREATE TABLE IF NOT EXISTS commodity_raw_market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
    source_type price_source_enum NOT NULL,
    price NUMERIC(14, 2) NOT NULL,
    market_location VARCHAR(150) NOT NULL,
    recorded_date DATE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_commodity_source_date_loc UNIQUE (commodity_id, source_type, market_location, recorded_date)
);

-- 3. Observasi Cuaca BMKG Terbuka per Kabupaten/Kota DIY
CREATE TABLE IF NOT EXISTS weather_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    regency diy_regency_enum NOT NULL,
    recorded_date DATE NOT NULL,
    rainfall_mm NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    humidity_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    temperature_celsius NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    weather_condition VARCHAR(100) NOT NULL DEFAULT 'Cerah Berawan',
    bmkg_station_code VARCHAR(50) NOT NULL DEFAULT 'BMKG-DIY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_weather_regency_date UNIQUE (regency, recorded_date)
);

-- 4. Feature Store Data ML
CREATE TABLE IF NOT EXISTS commodity_feature_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
    feature_date DATE NOT NULL,
    lag_1d NUMERIC(14, 2) NOT NULL,
    lag_3d NUMERIC(14, 2) NOT NULL,
    lag_7d NUMERIC(14, 2) NOT NULL,
    lag_14d NUMERIC(14, 2) NOT NULL,
    rolling_mean_7d NUMERIC(14, 2) NOT NULL,
    rolling_volatility_14d NUMERIC(14, 4) NOT NULL,
    cumulative_rainfall_3d NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    day_of_week INT NOT NULL,
    month_of_year INT NOT NULL,
    is_holiday_or_peak_tourism BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_commodity_feature_date UNIQUE (commodity_id, feature_date)
);

-- 5. Tabel Hasil Prakiraan Multi-Horizon & Action Window
CREATE TABLE IF NOT EXISTS commodity_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
    current_price NUMERIC(14, 2) NOT NULL,
    predicted_price_7d NUMERIC(14, 2) NOT NULL,
    predicted_price_30d NUMERIC(14, 2) NOT NULL,
    predicted_price_90d NUMERIC(14, 2) NOT NULL,
    trend forecast_trend_enum NOT NULL,
    trend_percentage NUMERIC(6, 2) NOT NULL,
    confidence_score NUMERIC(5, 2) NOT NULL,
    mape_accuracy NUMERIC(5, 2) NOT NULL,
    optimal_buy_start DATE NOT NULL,
    optimal_buy_end DATE NOT NULL,
    target_price NUMERIC(14, 2) NOT NULL,
    recommended_action recommended_action_enum NOT NULL,
    action_explanation TEXT NOT NULL,
    weather_risk_level weather_risk_level_enum NOT NULL,
    weather_risk_description TEXT NOT NULL,
    rainfall_forecast_mm NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    historical_and_projected JSONB NOT NULL DEFAULT '[]'::jsonb,
    algorithm VARCHAR(100) NOT NULL DEFAULT 'PasokML Ensemble v1.0 (LightGBM + AutoARIMA)',
    last_trained_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks Optimalisasi Query & Paginasi
CREATE INDEX IF NOT EXISTS idx_raw_market_prices_commodity_date ON commodity_raw_market_prices (commodity_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_weather_observations_regency_date ON weather_observations (regency, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_feature_store_commodity_date ON commodity_feature_store (commodity_id, feature_date DESC);
CREATE INDEX IF NOT EXISTS idx_forecasts_commodity_id ON commodity_forecasts (commodity_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_created_at ON commodity_forecasts (created_at DESC);

-- Seed Master Komoditas Unggulan DIY
INSERT INTO commodities (id, code, name, category, origin_region, unit, is_active)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CABAI_RAWIT_MERAH', 'Cabai Rawit Merah', 'Hortikultura', 'Kulon Progo (Panjatan)', 'kg', TRUE),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'BAWANG_MERAH', 'Bawang Merah Srikayangan', 'Hortikultura', 'Kulon Progo & Bantul', 'kg', TRUE),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'CABAI_MERAH_KERITING', 'Cabai Merah Keriting', 'Hortikultura', 'Sleman & Bantul', 'kg', TRUE),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'BERAS_PREMIUM_SLEMAN', 'Beras Premium Sleman', 'Pangan Pokok', 'Sleman', 'kg', TRUE),
    ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'BAWANG_PUTIH_HONAN', 'Bawang Putih Kating', 'Hortikultura', 'Nasional / Impor', 'kg', TRUE),
    ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'DAGING_AYAM_RAS', 'Daging Ayam Broiler', 'Pangan Pokok', 'Bantul & Sleman', 'kg', TRUE)
ON CONFLICT (code) DO NOTHING;
