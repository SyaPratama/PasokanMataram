# Database Schema - PasokMataram

## Entity Relationship Diagram

```mermaid
erDiagram
    tenants ||--o{ users : "has"
    tenants ||--o{ business_outlets : "operates"
    tenants ||--o{ supplier_profiles : "manages"
    tenants ||--o{ kyb_documents : "uploads"
    tenants ||--o{ pool_reservations : "creates"
    tenants ||--o{ b2b_reviews : "writes"
    
    supplier_profiles ||--o{ supplier_products : "offers"
    supplier_profiles ||--o{ pooling_campaigns : "creates"
    
    pooling_campaigns ||--o{ pool_reservations : "receives"
    pooling_campaigns }o--|| commodities : "sells"
    
    pool_reservations ||--|| escrow_settlements : "secures"
    pool_reservations ||--o{ weighing_verifications : "verified_by"
    
    commodities ||--o{ commodity_raw_market_prices : "has_prices"
    commodities ||--o{ commodity_forecasts : "has_forecasts"
    commodities ||--o{ commodity_feature_store : "has_features"
    
    users }o--|| tenants : "belongs_to"
    
    tenants {
        uuid id PK
        string business_name
        enum tenant_type
        enum kyb_status
        timestamp created_at
    }
    
    users {
        uuid id PK
        uuid tenant_id FK
        string email
        string password_hash
        enum user_role
        timestamp created_at
    }
    
    business_outlets {
        uuid id PK
        uuid tenant_id FK
        string outlet_name
        enum diy_regency
        string address
        decimal latitude
        decimal longitude
    }
    
    supplier_profiles {
        uuid id PK
        uuid tenant_id FK
        enum supplier_category
        string gapoktan_name
        string lead_farmer_name
        enum operational_regency
    }
    
    supplier_products {
        uuid id PK
        uuid supplier_id FK
        string commodity_name
        decimal capacity_kg_per_week
        decimal base_price_per_kg
    }
    
    pooling_campaigns {
        uuid id PK
        uuid supplier_id FK
        uuid commodity_id FK
        string campaign_name
        decimal target_quota_kg
        decimal current_collected_kg
        decimal pooled_price_per_kg
        timestamp deadline_at
        enum fulfillment_model
    }
    
    pool_reservations {
        uuid id PK
        uuid campaign_id FK
        uuid buyer_tenant_id FK
        decimal quantity_kg
        decimal total_amount_rp
        enum reservation_status
        timestamp reserved_at
    }
    
    escrow_settlements {
        uuid id PK
        uuid reservation_id FK
        decimal gross_amount_rp
        decimal buyer_fee_rp
        decimal merchant_fee_rp
        decimal net_disbursement_rp
        enum settlement_status
        timestamp scheduled_disbursement_at
    }
    
    kyb_documents {
        uuid id PK
        uuid tenant_id FK
        enum doc_type
        string file_storage_key
        string mime_type
        timestamp uploaded_at
    }
    
    weighing_verifications {
        uuid id PK
        uuid reservation_id FK
        decimal declared_kg
        decimal actual_kg
        decimal tolerance_percent
        enum weighing_tolerance_status
        string photo_proof_url
        timestamp verified_at
    }
    
    commodities {
        uuid id PK
        string commodity_name
        enum commodity_category
        string unit_of_measure
    }
    
    commodity_raw_market_prices {
        uuid id PK
        uuid commodity_id FK
        enum price_source
        decimal price_per_kg
        enum diy_regency
        date price_date
    }
    
    commodity_forecasts {
        uuid id PK
        uuid commodity_id FK
        date forecast_date
        decimal predicted_price_rp
        decimal confidence_lower
        decimal confidence_upper
        enum forecast_trend
        enum recommended_action
    }
    
    commodity_feature_store {
        uuid id PK
        uuid commodity_id FK
        date observation_date
        decimal price_7d_avg
        decimal price_14d_avg
        decimal price_volatility
        decimal seasonal_index
    }
    
    weather_observations {
        uuid id PK
        enum diy_regency
        date observation_date
        decimal rainfall_mm
        decimal temperature_avg_c
        enum weather_risk_level
    }
    
    b2b_reviews {
        uuid id PK
        uuid reviewer_tenant_id FK
        uuid reviewed_tenant_id FK
        enum review_direction
        integer rating_1_to_5
        text review_text
        timestamp created_at
    }
    
    funnel_telemetry_events {
        uuid id PK
        uuid tenant_id FK
        string event_name
        jsonb event_metadata
        timestamp event_at
    }
```

## Table Descriptions

### Core Entities

**tenants** - Multi-tenant root entity (HOREKA buyers or GAPOKTAN suppliers)  
**users** - User accounts with RBAC (SUPER_ADMIN, OWNER, PROCUREMENT_MANAGER, KITCHEN_STAFF)  
**business_outlets** - Physical locations for HOREKA buyers across DIY regencies  
**supplier_profiles** - Supplier metadata (farmer groups, cooperatives, processors)

### Product & Pooling

**commodities** - Master commodity catalog (vegetables, fruits, protein)  
**supplier_products** - Products offered by suppliers with capacity & base price  
**pooling_campaigns** - Group buying campaigns with target quota & deadline  
**pool_reservations** - Buyer reservations joining pooling campaigns

### Payment & Settlement

**escrow_settlements** - Escrow vault records with BPD DIY (dual-rail fees: 0.3% buyer, 0.5% merchant)  
**weighing_verifications** - QC hub digital scale verification with photo proof

### KYB & Compliance

**kyb_documents** - KYB document uploads (NIB, KTP, NPWP, Surat Keterangan Tani)

### ML & Forecasting

**commodity_raw_market_prices** - Historical price data from BAPANAS, PIHPS, internal escrow  
**commodity_forecasts** - LightGBM price predictions with confidence intervals  
**commodity_feature_store** - Engineered features for ML (7d avg, volatility, seasonal index)  
**weather_observations** - Weather data for supply risk modeling

### Analytics

**b2b_reviews** - Bidirectional reviews (buyer ↔ supplier trust scoring)  
**funnel_telemetry_events** - User behavior tracking for conversion optimization

## Key Design Patterns

1. **Multi-tenancy via RLS**: Row-level security policies enforce tenant isolation
2. **Branded Types**: UUIDs typed as `TenantId`, `UserId`, `CommodityId` for type safety
3. **Audit timestamps**: All tables have `created_at`, critical tables have `updated_at`
4. **Enum types**: PostgreSQL native enums for status fields (type-safe, indexed)
5. **Decimal precision**: Money & weights use `NUMERIC(10,2)` to avoid float errors
6. **Geospatial**: DIY regency enum + lat/long for logistics routing
7. **JSONB metadata**: Flexible telemetry events without schema migrations

## Indexes (Performance)

- Primary keys: UUID v4 with `uuid_generate_v4()`
- Foreign keys: Indexed for join performance
- Query hot paths: `tenant_id`, `created_at`, `reservation_status`
- Full-text search: Commodity names, supplier names (optional GIN index)

## Security

- **RLS policies**: `buyer_tenant_id = current_tenant_id` enforcement
- **Password hashing**: Argon2id (memory-hard, GPU-resistant)
- **JWT tokens**: HS256 with signature validation
- **File upload**: Magic byte validation, MIME whitelist
- **Rate limiting**: Redis-based (5 login/15min, 100 API/min)

## Constraints

- **Check constraints**: `total_amount_rp >= 500000` (MTV enforcement)
- **Foreign keys**: Cascade delete for dependent records
- **Unique constraints**: `(tenant_id, email)` for users
- **Not null**: Critical fields enforced at DB level
