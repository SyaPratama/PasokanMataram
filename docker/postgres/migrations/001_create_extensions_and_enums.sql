-- Migration 001: Ekstensi & Enum PasokMataram
-- Digunakan untuk fondasi tipe data domain dan fungsi gen_random_uuid

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_type_enum') THEN
        CREATE TYPE tenant_type_enum AS ENUM ('HOREKA_BUYER', 'GAPOKTAN_SUPPLIER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyb_status_enum') THEN
        CREATE TYPE kyb_status_enum AS ENUM ('UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('SUPER_ADMIN', 'OWNER', 'PROCUREMENT_MANAGER', 'KITCHEN_STAFF');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doc_type_enum') THEN
        CREATE TYPE doc_type_enum AS ENUM ('NIB', 'KTP', 'SURAT_KETERANGAN_TANI', 'NPWP');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'diy_regency_enum') THEN
        CREATE TYPE diy_regency_enum AS ENUM ('SLEMAN', 'BANTUL', 'KULON_PROGO', 'GUNUNGKIDUL', 'KOTA_YOGYAKARTA');
    END IF;
END $$;
