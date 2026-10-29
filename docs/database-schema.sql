--
-- PostgreSQL database dump
--

\restrict Ym7cpYV8WT4RqK7YFcvea98zQNoT3fbI13B8VsM0TJ7Y4sQLAQ3qFWxeCdgBrK4

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: root
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO root;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: root
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: b2b_review_direction_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.b2b_review_direction_enum AS ENUM (
    'BUYER_TO_SUPPLIER',
    'SUPPLIER_TO_BUYER'
);


ALTER TYPE public.b2b_review_direction_enum OWNER TO root;

--
-- Name: commodity_category_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.commodity_category_enum AS ENUM (
    'Hortikultura',
    'Pangan Pokok',
    'Perkebunan'
);


ALTER TYPE public.commodity_category_enum OWNER TO root;

--
-- Name: diy_regency_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.diy_regency_enum AS ENUM (
    'SLEMAN',
    'BANTUL',
    'KULON_PROGO',
    'GUNUNGKIDUL',
    'KOTA_YOGYAKARTA'
);


ALTER TYPE public.diy_regency_enum OWNER TO root;

--
-- Name: doc_type_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.doc_type_enum AS ENUM (
    'NIB',
    'KTP',
    'SURAT_KETERANGAN_TANI',
    'NPWP'
);


ALTER TYPE public.doc_type_enum OWNER TO root;

--
-- Name: forecast_trend_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.forecast_trend_enum AS ENUM (
    'UP',
    'DOWN',
    'STABLE'
);


ALTER TYPE public.forecast_trend_enum OWNER TO root;

--
-- Name: fulfillment_model_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.fulfillment_model_enum AS ENUM (
    'POOL_GROUP_BUYING',
    'DIRECT_DISPATCH',
    'CROSS_DOCK'
);


ALTER TYPE public.fulfillment_model_enum OWNER TO root;

--
-- Name: kyb_status_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.kyb_status_enum AS ENUM (
    'UNVERIFIED',
    'PENDING_VERIFICATION',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public.kyb_status_enum OWNER TO root;

--
-- Name: price_source_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.price_source_enum AS ENUM (
    'BAPANAS',
    'PIHPS',
    'PASAR_LELANG',
    'INTERNAL_ESCROW'
);


ALTER TYPE public.price_source_enum OWNER TO root;

--
-- Name: recommended_action_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.recommended_action_enum AS ENUM (
    'BELI_SEKARANG',
    'TUNGGU_PANEN_RAYA',
    'KUNCI_KONTRAK'
);


ALTER TYPE public.recommended_action_enum OWNER TO root;

--
-- Name: reservation_status_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.reservation_status_enum AS ENUM (
    'PENDING_PAYMENT',
    'PAID',
    'ALLOCATED',
    'RECEIVED',
    'CANCELLED',
    'DISPUTED'
);


ALTER TYPE public.reservation_status_enum OWNER TO root;

--
-- Name: settlement_status_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.settlement_status_enum AS ENUM (
    'ESCROW_LOCKED',
    'READY_FOR_DISBURSEMENT',
    'DISBURSED',
    'HELD_DISPUTE',
    'REFUNDED'
);


ALTER TYPE public.settlement_status_enum OWNER TO root;

--
-- Name: supplier_category_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.supplier_category_enum AS ENUM (
    'FARMER_GROUP',
    'LIVESTOCK_FARM',
    'MEAT_PROCESSOR',
    'DAIRY_COOPERATIVE',
    'FOOD_DISTRIBUTOR',
    'ARTISANAL_PRODUCER'
);


ALTER TYPE public.supplier_category_enum OWNER TO root;

--
-- Name: temperature_zone_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.temperature_zone_enum AS ENUM (
    'FROZEN',
    'CHILLED',
    'AMBIENT_VENTILATED'
);


ALTER TYPE public.temperature_zone_enum OWNER TO root;

--
-- Name: tenant_type_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.tenant_type_enum AS ENUM (
    'HOREKA_BUYER',
    'GAPOKTAN_SUPPLIER'
);


ALTER TYPE public.tenant_type_enum OWNER TO root;

--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.user_role_enum AS ENUM (
    'SUPER_ADMIN',
    'OWNER',
    'PROCUREMENT_MANAGER',
    'KITCHEN_STAFF'
);


ALTER TYPE public.user_role_enum OWNER TO root;

--
-- Name: weather_risk_level_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.weather_risk_level_enum AS ENUM (
    'RENDAH',
    'SEDANG',
    'TINGGI'
);


ALTER TYPE public.weather_risk_level_enum OWNER TO root;

--
-- Name: weighing_tolerance_status_enum; Type: TYPE; Schema: public; Owner: root
--

CREATE TYPE public.weighing_tolerance_status_enum AS ENUM (
    'WITHIN_TOLERANCE',
    'ACCEPTABLE_DEFICIT',
    'EXCESS_DEFICIT',
    'SURPLUS'
);


ALTER TYPE public.weighing_tolerance_status_enum OWNER TO root;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _migrations; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public._migrations (
    id integer NOT NULL,
    filename character varying(255) NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public._migrations OWNER TO root;

--
-- Name: _migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public._migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._migrations_id_seq OWNER TO root;

--
-- Name: _migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public._migrations_id_seq OWNED BY public._migrations.id;


--
-- Name: b2b_reviews; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.b2b_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_tenant_id uuid NOT NULL,
    to_tenant_id uuid NOT NULL,
    direction public.b2b_review_direction_enum NOT NULL,
    rating integer NOT NULL,
    quality_score integer,
    punctuality_score integer,
    payment_speed_score integer,
    comment text NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[] NOT NULL,
    verified_order_reference character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2b_reviews_payment_speed_score_check CHECK (((payment_speed_score >= 1) AND (payment_speed_score <= 5))),
    CONSTRAINT b2b_reviews_punctuality_score_check CHECK (((punctuality_score >= 1) AND (punctuality_score <= 5))),
    CONSTRAINT b2b_reviews_quality_score_check CHECK (((quality_score >= 1) AND (quality_score <= 5))),
    CONSTRAINT b2b_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.b2b_reviews OWNER TO root;

--
-- Name: business_outlets; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.business_outlets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    outlet_name character varying(255) NOT NULL,
    street_address text NOT NULL,
    regency public.diy_regency_enum NOT NULL,
    district character varying(100) NOT NULL,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    contact_person character varying(255) NOT NULL,
    contact_phone character varying(50) NOT NULL,
    is_main_outlet boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.business_outlets OWNER TO root;

--
-- Name: commodities; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.commodities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(150) NOT NULL,
    category public.commodity_category_enum NOT NULL,
    origin_region character varying(100) NOT NULL,
    unit character varying(20) DEFAULT 'kg'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.commodities OWNER TO root;

--
-- Name: commodity_feature_store; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.commodity_feature_store (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    commodity_id uuid NOT NULL,
    feature_date date NOT NULL,
    lag_1d numeric(14,2) NOT NULL,
    lag_3d numeric(14,2) NOT NULL,
    lag_7d numeric(14,2) NOT NULL,
    lag_14d numeric(14,2) NOT NULL,
    rolling_mean_7d numeric(14,2) NOT NULL,
    rolling_volatility_14d numeric(14,4) NOT NULL,
    cumulative_rainfall_3d numeric(8,2) DEFAULT 0.0 NOT NULL,
    day_of_week integer NOT NULL,
    month_of_year integer NOT NULL,
    is_holiday_or_peak_tourism boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.commodity_feature_store OWNER TO root;

--
-- Name: commodity_forecasts; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.commodity_forecasts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    commodity_id uuid NOT NULL,
    current_price numeric(14,2) NOT NULL,
    predicted_price_7d numeric(14,2) NOT NULL,
    predicted_price_30d numeric(14,2) NOT NULL,
    predicted_price_90d numeric(14,2) NOT NULL,
    trend public.forecast_trend_enum NOT NULL,
    trend_percentage numeric(6,2) NOT NULL,
    confidence_score numeric(5,2) NOT NULL,
    mape_accuracy numeric(5,2) NOT NULL,
    optimal_buy_start date NOT NULL,
    optimal_buy_end date NOT NULL,
    target_price numeric(14,2) NOT NULL,
    recommended_action public.recommended_action_enum NOT NULL,
    action_explanation text NOT NULL,
    weather_risk_level public.weather_risk_level_enum NOT NULL,
    weather_risk_description text NOT NULL,
    rainfall_forecast_mm numeric(8,2) DEFAULT 0.0 NOT NULL,
    historical_and_projected jsonb DEFAULT '[]'::jsonb NOT NULL,
    algorithm character varying(100) DEFAULT 'PasokML Ensemble v1.0 (LightGBM + AutoARIMA)'::character varying NOT NULL,
    last_trained_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.commodity_forecasts OWNER TO root;

--
-- Name: commodity_raw_market_prices; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.commodity_raw_market_prices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    commodity_id uuid NOT NULL,
    source_type public.price_source_enum NOT NULL,
    price numeric(14,2) NOT NULL,
    market_location character varying(150) NOT NULL,
    recorded_date date NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.commodity_raw_market_prices OWNER TO root;

--
-- Name: escrow_settlements; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.escrow_settlements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reservation_id uuid NOT NULL,
    supplier_tenant_id uuid NOT NULL,
    buyer_tenant_id uuid NOT NULL,
    gross_amount_rp numeric(14,2) NOT NULL,
    platform_fee_rp numeric(14,2) DEFAULT 0.00 NOT NULL,
    net_disbursement_rp numeric(14,2) NOT NULL,
    status public.settlement_status_enum DEFAULT 'ESCROW_LOCKED'::public.settlement_status_enum NOT NULL,
    scheduled_disbursement_at timestamp with time zone NOT NULL,
    disbursed_at timestamp with time zone,
    dispute_reason text,
    dispute_refund_rp numeric(14,2) DEFAULT 0.00,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.escrow_settlements FORCE ROW LEVEL SECURITY;


ALTER TABLE public.escrow_settlements OWNER TO root;

--
-- Name: funnel_telemetry_events; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.funnel_telemetry_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    step character varying(50) NOT NULL,
    campaign_id uuid NOT NULL,
    buyer_tenant_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.funnel_telemetry_events FORCE ROW LEVEL SECURITY;


ALTER TABLE public.funnel_telemetry_events OWNER TO root;

--
-- Name: kyb_documents; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.kyb_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    document_type public.doc_type_enum NOT NULL,
    document_number character varying(100) NOT NULL,
    file_storage_key character varying(500) NOT NULL,
    file_mime_type character varying(100) NOT NULL,
    file_size_bytes integer NOT NULL,
    status public.kyb_status_enum DEFAULT 'PENDING_VERIFICATION'::public.kyb_status_enum NOT NULL,
    rejection_note text,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT kyb_documents_file_size_bytes_check CHECK ((file_size_bytes <= 5242880))
);


ALTER TABLE public.kyb_documents OWNER TO root;

--
-- Name: pool_reservations; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.pool_reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    buyer_tenant_id uuid NOT NULL,
    quantity_kg numeric(10,2) NOT NULL,
    price_per_kg numeric(14,2) NOT NULL,
    total_amount_rp numeric(14,2) NOT NULL,
    status public.reservation_status_enum DEFAULT 'PENDING_PAYMENT'::public.reservation_status_enum NOT NULL,
    delivery_address text NOT NULL,
    va_number character varying(50),
    payment_reference character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_minimum_transaction_value CHECK ((total_amount_rp >= 500000.00)),
    CONSTRAINT chk_positive_quantity CHECK ((quantity_kg > (0)::numeric))
);

ALTER TABLE ONLY public.pool_reservations FORCE ROW LEVEL SECURITY;


ALTER TABLE public.pool_reservations OWNER TO root;

--
-- Name: pooling_campaigns; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.pooling_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    supplier_tenant_id uuid NOT NULL,
    commodity_name character varying(150) NOT NULL,
    commodity_category public.commodity_category_enum NOT NULL,
    temperature_zone public.temperature_zone_enum DEFAULT 'AMBIENT_VENTILATED'::public.temperature_zone_enum NOT NULL,
    target_quota_kg numeric(12,2) NOT NULL,
    allocated_quota_kg numeric(12,2) DEFAULT 0.00 NOT NULL,
    price_per_kg numeric(14,2) NOT NULL,
    min_order_kg numeric(10,2) DEFAULT 5.00 NOT NULL,
    status character varying(50) DEFAULT 'OPEN'::character varying NOT NULL,
    starts_at timestamp with time zone DEFAULT now() NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.pooling_campaigns FORCE ROW LEVEL SECURITY;


ALTER TABLE public.pooling_campaigns OWNER TO root;

--
-- Name: supplier_products; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.supplier_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    supplier_tenant_id uuid NOT NULL,
    name character varying(150) NOT NULL,
    category character varying(50) NOT NULL,
    sku_code character varying(50) NOT NULL,
    unit character varying(30) DEFAULT 'kg'::character varying NOT NULL,
    price numeric(14,2) NOT NULL,
    min_order_qty numeric(10,2) DEFAULT 1.0 NOT NULL,
    stock_available numeric(10,2) DEFAULT 100.0 NOT NULL,
    lead_time_hours integer DEFAULT 12 NOT NULL,
    is_ready_stock boolean DEFAULT true NOT NULL,
    fulfillment_type public.fulfillment_model_enum DEFAULT 'DIRECT_DISPATCH'::public.fulfillment_model_enum NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.supplier_products OWNER TO root;

--
-- Name: supplier_profiles; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.supplier_profiles (
    tenant_id uuid NOT NULL,
    category public.supplier_category_enum DEFAULT 'FOOD_DISTRIBUTOR'::public.supplier_category_enum NOT NULL,
    fulfillment_model public.fulfillment_model_enum DEFAULT 'DIRECT_DISPATCH'::public.fulfillment_model_enum NOT NULL,
    has_cold_chain boolean DEFAULT false NOT NULL,
    certifications jsonb DEFAULT '[]'::jsonb NOT NULL,
    rating_avg numeric(3,2) DEFAULT 5.00 NOT NULL,
    review_count integer DEFAULT 0 NOT NULL,
    bio text,
    minimum_order_rp numeric(14,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.supplier_profiles OWNER TO root;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_name character varying(255) NOT NULL,
    tenant_type public.tenant_type_enum NOT NULL,
    regency public.diy_regency_enum NOT NULL,
    kyb_status public.kyb_status_enum DEFAULT 'UNVERIFIED'::public.kyb_status_enum NOT NULL,
    rejection_reason text,
    verified_at timestamp with time zone,
    verified_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tenants OWNER TO root;

--
-- Name: users; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    phone_number character varying(50) NOT NULL,
    role public.user_role_enum DEFAULT 'OWNER'::public.user_role_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO root;

--
-- Name: weather_observations; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.weather_observations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    regency public.diy_regency_enum NOT NULL,
    recorded_date date NOT NULL,
    rainfall_mm numeric(8,2) DEFAULT 0.0 NOT NULL,
    humidity_percent numeric(5,2) DEFAULT 0.0 NOT NULL,
    temperature_celsius numeric(5,2) DEFAULT 0.0 NOT NULL,
    weather_condition character varying(100) DEFAULT 'Cerah Berawan'::character varying NOT NULL,
    bmkg_station_code character varying(50) DEFAULT 'BMKG-DIY'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.weather_observations OWNER TO root;

--
-- Name: weighing_verifications; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.weighing_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reservation_id uuid NOT NULL,
    hub_id character varying(50) NOT NULL,
    operator_id uuid NOT NULL,
    commodity_category public.commodity_category_enum NOT NULL,
    temperature_zone public.temperature_zone_enum NOT NULL,
    measured_temp_celsius numeric(5,2) NOT NULL,
    manifest_weight_kg numeric(10,2) NOT NULL,
    actual_weight_kg numeric(10,2) NOT NULL,
    weight_difference_kg numeric(10,2) NOT NULL,
    shrinkage_percentage numeric(5,2) DEFAULT 0.00 NOT NULL,
    tolerance_status public.weighing_tolerance_status_enum NOT NULL,
    is_temperature_compliant boolean DEFAULT true NOT NULL,
    scale_device_id character varying(100) NOT NULL,
    notes text,
    verified_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.weighing_verifications FORCE ROW LEVEL SECURITY;


ALTER TABLE public.weighing_verifications OWNER TO root;

--
-- Name: _migrations id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public._migrations ALTER COLUMN id SET DEFAULT nextval('public._migrations_id_seq'::regclass);


--
-- Name: _migrations _migrations_filename_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public._migrations
    ADD CONSTRAINT _migrations_filename_key UNIQUE (filename);


--
-- Name: _migrations _migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public._migrations
    ADD CONSTRAINT _migrations_pkey PRIMARY KEY (id);


--
-- Name: b2b_reviews b2b_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.b2b_reviews
    ADD CONSTRAINT b2b_reviews_pkey PRIMARY KEY (id);


--
-- Name: business_outlets business_outlets_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.business_outlets
    ADD CONSTRAINT business_outlets_pkey PRIMARY KEY (id);


--
-- Name: commodities commodities_code_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.commodities
    ADD CONSTRAINT commodities_code_key UNIQUE (code);


--
-- Name: commodities commodities_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.commodities
    ADD CONSTRAINT commodities_pkey PRIMARY KEY (id);


--
-- Name: commodity_feature_store commodity_feature_store_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.commodity_feature_store
    ADD CONSTRAINT commodity_feature_store_pkey PRIMARY KEY (id);


--
-- Name: commodity_forecasts commodity_forecasts_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.commodity_forecasts
    ADD CONSTRAINT commodity_forecasts_pkey PRIMARY KEY (id);


--
-- Name: commodity_raw_market_prices commodity_raw_market_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.commodity_raw_market_prices
    ADD CONSTRAINT commodity_raw_market_prices_pkey PRIMARY KEY (id);


--
-- Name: escrow_settlements escrow_settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.escrow_settlements
    ADD CONSTRAINT escrow_settlements_pkey PRIMARY KEY (id);


--
-- Name: escrow_settlements escrow_settlements_reservation_id_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.escrow_settlements
    ADD CONSTRAINT escrow_settlements_reservation_id_key UNIQUE (reservation_id);


--
-- Name: funnel_telemetry_events funnel_telemetry_events_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.funnel_telemetry_events
    ADD CONSTRAINT funnel_telemetry_events_pkey PRIMARY KEY (id);


--
-- Name: kyb_documents kyb_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.kyb_documents
    ADD CONSTRAINT kyb_documents_pkey PRIMARY KEY (id);


--
-- Name: pool_reservations pool_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.pool_reservations
    ADD CONSTRAINT pool_reservations_pkey PRIMARY KEY (id);


--
-- Name: pooling_campaigns pooling_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.pooling_campaigns
    ADD CONSTRAINT pooling_campaigns_pkey PRIMARY KEY (id);


--
-- Name: supplier_products supplier_products_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.supplier_products
    ADD CONSTRAINT supplier_products_pkey PRIMARY KEY (id);


--
-- Name: supplier_profiles supplier_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.supplier_profiles
    ADD CONSTRAINT supplier_profiles_pkey PRIMARY KEY (tenant_id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: commodity_feature_store uq_commodity_feature_date; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.commodity_feature_store
    ADD CONSTRAINT uq_commodity_feature_date UNIQUE (commodity_id, feature_date);


--
-- Name: commodity_raw_market_prices uq_commodity_source_date_loc; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.commodity_raw_market_prices
    ADD CONSTRAINT uq_commodity_source_date_loc UNIQUE (commodity_id, source_type, market_location, recorded_date);


--
-- Name: supplier_products uq_supplier_sku; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.supplier_products
    ADD CONSTRAINT uq_supplier_sku UNIQUE (supplier_tenant_id, sku_code);


--
-- Name: weather_observations uq_weather_regency_date; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.weather_observations
    ADD CONSTRAINT uq_weather_regency_date UNIQUE (regency, recorded_date);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: weather_observations weather_observations_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.weather_observations
    ADD CONSTRAINT weather_observations_pkey PRIMARY KEY (id);


--
-- Name: weighing_verifications weighing_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.weighing_verifications
    ADD CONSTRAINT weighing_verifications_pkey PRIMARY KEY (id);


--
-- Name: idx_b2b_reviews_from_tenant; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_b2b_reviews_from_tenant ON public.b2b_reviews USING btree (from_tenant_id);


--
-- Name: idx_b2b_reviews_to_tenant; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_b2b_reviews_to_tenant ON public.b2b_reviews USING btree (to_tenant_id, direction);


--
-- Name: idx_escrow_settlements_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_escrow_settlements_status ON public.escrow_settlements USING btree (status, scheduled_disbursement_at);


--
-- Name: idx_feature_store_commodity_date; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_feature_store_commodity_date ON public.commodity_feature_store USING btree (commodity_id, feature_date DESC);


--
-- Name: idx_forecasts_commodity_id; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_forecasts_commodity_id ON public.commodity_forecasts USING btree (commodity_id);


--
-- Name: idx_forecasts_created_at; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_forecasts_created_at ON public.commodity_forecasts USING btree (created_at DESC);


--
-- Name: idx_kyb_docs_tenant_status; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_kyb_docs_tenant_status ON public.kyb_documents USING btree (tenant_id, status);


--
-- Name: idx_outlets_tenant_regency; Type: INDEX; Schema: public; Owner: root
--

CREATE INDEX idx_outlets_tenant_regency ON public.business_outlets USING btree (tenant_id, regency);

