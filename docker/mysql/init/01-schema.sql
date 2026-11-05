-- PasokMataram MySQL 8.0 Schema
-- Ported from PostgreSQL migrations 001-011
-- UUID as CHAR(36), TIMESTAMPTZ as DATETIME, native ENUMs

-- 1. Core tenants
CREATE TABLE IF NOT EXISTS tenants (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_name VARCHAR(255) NOT NULL,
    tenant_type ENUM('HOREKA_BUYER', 'GAPOKTAN_SUPPLIER') NOT NULL,
    regency ENUM('SLEMAN', 'BANTUL', 'KULON_PROGO', 'GUNUNGKIDUL', 'KOTA_YOGYAKARTA') NOT NULL,
    kyb_status ENUM('UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
    rejection_reason TEXT,
    verified_at DATETIME,
    verified_by CHAR(36),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_type (tenant_type),
    INDEX idx_kyb_status (kyb_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    role ENUM('SUPER_ADMIN', 'OWNER', 'PROCUREMENT_MANAGER', 'KITCHEN_STAFF') NOT NULL DEFAULT 'OWNER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_users_tenant (tenant_id),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. KYB documents
CREATE TABLE IF NOT EXISTS kyb_documents (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    document_type ENUM('NIB', 'KTP', 'SURAT_KETERANGAN_TANI', 'NPWP') NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    file_storage_key VARCHAR(500) NOT NULL,
    file_mime_type VARCHAR(100) NOT NULL,
    file_size_bytes INT NOT NULL DEFAULT 0,
    status ENUM('UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    rejection_note TEXT,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_by CHAR(36),
    verified_at DATETIME,
    rejection_reason TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_kyb_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_kyb_tenant_status (tenant_id, status),
    INDEX idx_kyb_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Business outlets
CREATE TABLE IF NOT EXISTS business_outlets (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    outlet_name VARCHAR(255) NOT NULL,
    regency ENUM('SLEMAN', 'BANTUL', 'KULON_PROGO', 'GUNUNGKIDUL', 'KOTA_YOGYAKARTA') NOT NULL,
    address TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_outlets_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_outlets_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Commodities (using English categories from migration 010)
CREATE TABLE IF NOT EXISTS commodities (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category ENUM('MEAT', 'MILK', 'PERISHABLE_VEGETABLE', 'GRAIN', 'PROCESSED') NOT NULL,
    origin_region VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_commodities_category (category),
    INDEX idx_commodities_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Commodity taxonomy mapping (ML training labels)
CREATE TABLE IF NOT EXISTS commodity_taxonomy_mapping (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_category ENUM('MEAT', 'MILK', 'PERISHABLE_VEGETABLE', 'GRAIN', 'PROCESSED') NOT NULL UNIQUE,
    ml_training_label VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Raw market prices
CREATE TABLE IF NOT EXISTS commodity_raw_market_prices (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    commodity_id CHAR(36) NOT NULL,
    source_type ENUM('BAPANAS', 'PIHPS', 'PASAR_LELANG', 'INTERNAL_ESCROW') NOT NULL,
    price DECIMAL(14, 2) NOT NULL,
    market_location VARCHAR(150) NOT NULL,
    recorded_date DATE NOT NULL,
    metadata JSON,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_raw_prices_commodity FOREIGN KEY (commodity_id) REFERENCES commodities(id) ON DELETE CASCADE,
    UNIQUE KEY uq_commodity_source_date_loc (commodity_id, source_type, market_location, recorded_date),
    INDEX idx_raw_prices_commodity_date (commodity_id, recorded_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Weather observations
CREATE TABLE IF NOT EXISTS weather_observations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    regency ENUM('SLEMAN', 'BANTUL', 'KULON_PROGO', 'GUNUNGKIDUL', 'KOTA_YOGYAKARTA') NOT NULL,
    recorded_date DATE NOT NULL,
    rainfall_mm DECIMAL(8, 2) NOT NULL DEFAULT 0.0,
    humidity_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.0,
    temperature_celsius DECIMAL(5, 2) NOT NULL DEFAULT 0.0,
    weather_condition VARCHAR(100) NOT NULL DEFAULT 'Cerah Berawan',
    bmkg_station_code VARCHAR(50) NOT NULL DEFAULT 'BMKG-DIY',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_weather_regency_date (regency, recorded_date),
    INDEX idx_weather_regency_date (regency, recorded_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Feature store
CREATE TABLE IF NOT EXISTS commodity_feature_store (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    commodity_id CHAR(36) NOT NULL,
    feature_date DATE NOT NULL,
    lag_1d DECIMAL(14, 2) NOT NULL,
    lag_3d DECIMAL(14, 2) NOT NULL,
    lag_7d DECIMAL(14, 2) NOT NULL,
    lag_14d DECIMAL(14, 2) NOT NULL,
    rolling_mean_7d DECIMAL(14, 2) NOT NULL,
    rolling_volatility_14d DECIMAL(14, 4) NOT NULL,
    cumulative_rainfall_3d DECIMAL(8, 2) NOT NULL DEFAULT 0.0,
    day_of_week INT NOT NULL,
    month_of_year INT NOT NULL,
    is_holiday_or_peak_tourism BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_features_commodity FOREIGN KEY (commodity_id) REFERENCES commodities(id) ON DELETE CASCADE,
    UNIQUE KEY uq_commodity_feature_date (commodity_id, feature_date),
    INDEX idx_feature_store_commodity_date (commodity_id, feature_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Commodity forecasts (keep multi-horizon columns - always queried together)
CREATE TABLE IF NOT EXISTS commodity_forecasts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    commodity_id CHAR(36) NOT NULL,
    current_price DECIMAL(14, 2) NOT NULL,
    predicted_price_7d DECIMAL(14, 2) NOT NULL,
    predicted_price_30d DECIMAL(14, 2) NOT NULL,
    predicted_price_90d DECIMAL(14, 2) NOT NULL,
    trend ENUM('UP', 'DOWN', 'STABLE') NOT NULL,
    trend_percentage DECIMAL(6, 2) NOT NULL,
    confidence_score DECIMAL(5, 2) NOT NULL,
    mape_accuracy DECIMAL(5, 2) NOT NULL,
    optimal_buy_start DATE NOT NULL,
    optimal_buy_end DATE NOT NULL,
    target_price DECIMAL(14, 2) NOT NULL,
    recommended_action ENUM('BELI_SEKARANG', 'TUNGGU_PANEN_RAYA', 'KUNCI_KONTRAK') NOT NULL,
    action_explanation TEXT NOT NULL,
    weather_risk_level ENUM('RENDAH', 'SEDANG', 'TINGGI') NOT NULL,
    weather_risk_description TEXT NOT NULL,
    rainfall_forecast_mm DECIMAL(8, 2) NOT NULL DEFAULT 0.0,
    historical_and_projected JSON NOT NULL,
    algorithm VARCHAR(100) NOT NULL DEFAULT 'PasokML Ensemble v1.0 (LightGBM + AutoARIMA)',
    last_trained_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_forecasts_commodity FOREIGN KEY (commodity_id) REFERENCES commodities(id) ON DELETE CASCADE,
    INDEX idx_forecasts_commodity (commodity_id),
    INDEX idx_forecasts_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Supplier profiles
CREATE TABLE IF NOT EXISTS supplier_profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    business_description TEXT,
    certifications JSON,
    production_capacity_kg DECIMAL(12, 2),
    delivery_radius_km INT,
    min_order_value_rp DECIMAL(14, 2) DEFAULT 500000.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_supplier_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_supplier_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Supplier products
CREATE TABLE IF NOT EXISTS supplier_products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    supplier_tenant_id CHAR(36) NOT NULL,
    commodity_name VARCHAR(150) NOT NULL,
    price_per_kg DECIMAL(14, 2) NOT NULL,
    stock_kg DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_products_supplier (supplier_tenant_id),
    INDEX idx_products_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. B2B reviews
CREATE TABLE IF NOT EXISTS b2b_reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reviewer_tenant_id CHAR(36) NOT NULL,
    reviewee_tenant_id CHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewee FOREIGN KEY (reviewee_tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_reviews_reviewee (reviewee_tenant_id),
    INDEX idx_reviews_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Review tags (normalized from TEXT[])
CREATE TABLE IF NOT EXISTS review_tags (
    review_id CHAR(36) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (review_id, tag),
    CONSTRAINT fk_tags_review FOREIGN KEY (review_id) REFERENCES b2b_reviews(id) ON DELETE CASCADE,
    INDEX idx_tags_tag (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Pooling campaigns
CREATE TABLE IF NOT EXISTS pooling_campaigns (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    supplier_tenant_id CHAR(36) NOT NULL,
    commodity_name VARCHAR(150) NOT NULL,
    commodity_category ENUM('MEAT', 'MILK', 'PERISHABLE_VEGETABLE', 'GRAIN', 'PROCESSED') NOT NULL,
    temperature_zone ENUM('FROZEN', 'CHILLED', 'AMBIENT_VENTILATED') NOT NULL DEFAULT 'AMBIENT_VENTILATED',
    target_quota_kg DECIMAL(12, 2) NOT NULL,
    allocated_quota_kg DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    price_per_kg DECIMAL(14, 2) NOT NULL,
    min_order_kg DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    starts_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ends_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_campaigns_supplier FOREIGN KEY (supplier_tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_campaigns_status_dates (status, starts_at, ends_at),
    INDEX idx_campaigns_supplier (supplier_tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Pool reservations
CREATE TABLE IF NOT EXISTS pool_reservations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    campaign_id CHAR(36) NOT NULL,
    buyer_tenant_id CHAR(36) NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL,
    price_per_kg DECIMAL(14, 2) NOT NULL,
    total_amount_rp DECIMAL(14, 2) NOT NULL,
    status ENUM('PENDING_PAYMENT', 'PAID', 'ALLOCATED', 'RECEIVED', 'CANCELLED', 'DISPUTED') NOT NULL DEFAULT 'PENDING_PAYMENT',
    delivery_address TEXT NOT NULL,
    va_number VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservations_campaign FOREIGN KEY (campaign_id) REFERENCES pooling_campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservations_buyer FOREIGN KEY (buyer_tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT chk_minimum_transaction_value CHECK (total_amount_rp >= 500000.00),
    CONSTRAINT chk_positive_quantity CHECK (quantity_kg > 0),
    INDEX idx_reservations_campaign (campaign_id),
    INDEX idx_reservations_buyer (buyer_tenant_id),
    INDEX idx_reservations_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Weighing verifications
CREATE TABLE IF NOT EXISTS weighing_verifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reservation_id CHAR(36) NOT NULL,
    hub_id VARCHAR(50) NOT NULL,
    operator_id CHAR(36) NOT NULL,
    commodity_category ENUM('MEAT', 'MILK', 'PERISHABLE_VEGETABLE', 'GRAIN', 'PROCESSED') NOT NULL,
    temperature_zone ENUM('FROZEN', 'CHILLED', 'AMBIENT_VENTILATED') NOT NULL,
    measured_temp_celsius DECIMAL(5, 2) NOT NULL,
    manifest_weight_kg DECIMAL(10, 2) NOT NULL,
    actual_weight_kg DECIMAL(10, 2) NOT NULL,
    weight_difference_kg DECIMAL(10, 2) NOT NULL,
    shrinkage_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    tolerance_status ENUM('WITHIN_TOLERANCE', 'ACCEPTABLE_DEFICIT', 'EXCESS_DEFICIT', 'SURPLUS') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_weighing_reservation FOREIGN KEY (reservation_id) REFERENCES pool_reservations(id) ON DELETE CASCADE,
    CONSTRAINT fk_weighing_operator FOREIGN KEY (operator_id) REFERENCES users(id),
    INDEX idx_weighing_reservation (reservation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Escrow settlements
CREATE TABLE IF NOT EXISTS escrow_settlements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reservation_id CHAR(36) NOT NULL,
    escrow_account_number VARCHAR(50) NOT NULL,
    locked_amount_rp DECIMAL(14, 2) NOT NULL,
    disbursed_amount_rp DECIMAL(14, 2),
    status ENUM('ESCROW_LOCKED', 'READY_FOR_DISBURSEMENT', 'DISBURSED', 'HELD_DISPUTE', 'REFUNDED') NOT NULL DEFAULT 'ESCROW_LOCKED',
    locked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disbursed_at DATETIME,
    dispute_reason TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_settlement_reservation FOREIGN KEY (reservation_id) REFERENCES pool_reservations(id) ON DELETE CASCADE,
    INDEX idx_settlement_status (status),
    INDEX idx_settlement_reservation (reservation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Funnel telemetry
CREATE TABLE IF NOT EXISTS funnel_telemetry_events (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    campaign_id CHAR(36) NOT NULL,
    tenant_id CHAR(36) NOT NULL,
    event_stage VARCHAR(100) NOT NULL,
    event_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    CONSTRAINT fk_funnel_campaign FOREIGN KEY (campaign_id) REFERENCES pooling_campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_funnel_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_funnel_campaign (campaign_id),
    INDEX idx_funnel_timestamp (event_timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    user_id CHAR(36),
    category ENUM('ORDER', 'POOLING', 'PAYMENT', 'QC_DISPUTE', 'KYB_STATUS', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    action_url VARCHAR(255),
    payload JSON NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_notifications_tenant_unread (tenant_id, is_read, created_at DESC),
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. User push subscriptions
CREATE TABLE IF NOT EXISTS user_push_subscriptions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    user_id CHAR(36),
    endpoint TEXT NOT NULL,
    endpoint_hash CHAR(64) GENERATED ALWAYS AS (SHA2(endpoint, 256)) STORED UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_push_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_push_tenant_active (tenant_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- 22. Notification delivery logs
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    notification_id CHAR(36) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    delivered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'DELIVERED',
    failure_reason TEXT,
    CONSTRAINT fk_delivery_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    INDEX idx_delivery_notification (notification_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
