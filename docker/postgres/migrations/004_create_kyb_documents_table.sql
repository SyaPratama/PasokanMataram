-- Migration 004: Tabel KYB Documents (3NF Compliant)
-- Berkas legalitas resmi (NIB, KTP, Surat Kelompok Tani) berformat WebP/PDF max 5MB

CREATE TABLE IF NOT EXISTS kyb_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_type doc_type_enum NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    file_storage_key VARCHAR(500) NOT NULL,
    file_mime_type VARCHAR(100) NOT NULL,
    file_size_bytes INT NOT NULL CHECK (file_size_bytes <= 5242880),
    status kyb_status_enum NOT NULL DEFAULT 'PENDING_VERIFICATION',
    rejection_note TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
