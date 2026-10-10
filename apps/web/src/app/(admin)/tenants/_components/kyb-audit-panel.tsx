import * as React from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { FileText, CheckCircle2, XCircle, ArrowLeft, Building2, User, Phone, Mail, MapPin } from 'lucide-react';
import type { KybStatus } from '@pasok/domain';

export interface KybAuditDetail {
  tenantId: string;
  businessName: string;
  tenantType: 'HOREKA_BUYER' | 'GAPOKTAN_SUPPLIER';
  regency: string;
  kybStatus: KybStatus;
  rejectionReason?: string | null;
  owner: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  documents: Array<{
    documentId: string;
    documentType: string;
    documentNumber: string;
    status: KybStatus;
    fileStorageKey: string;
    fileMimeType: string;
    fileSizeBytes: number;
    rejectionNote?: string | null;
    uploadedAt: string;
  }>;
}

interface KybAuditPanelProps {
  tenant: KybAuditDetail;
  onBack: () => void;
  onOpenReviewModal: (decision: 'APPROVED' | 'REJECTED') => void;
  isLoading?: boolean;
}

export function KybAuditPanel({ tenant, onBack, onOpenReviewModal, isLoading }: KybAuditPanelProps) {
  return (
    <div className="w-full bg-white rounded-lg border border-netral-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-netral-border flex flex-wrap items-center justify-between gap-3 bg-netral-canvas/60">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-md hover:bg-netral-border/40 text-gelap transition-colors focus:outline-none focus:ring-2 focus:ring-primer"
            aria-label="Kembali ke antrean"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-heading font-bold text-gelap">{tenant.businessName}</h2>
            <p className="text-xs text-gelap/80">ID Entitas: {tenant.tenantId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={tenant.kybStatus} />
          {tenant.kybStatus === 'PENDING_VERIFICATION' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenReviewModal('REJECTED')}
                disabled={isLoading}
                className="border-red-300 text-red-700 hover:bg-red-50 focus:ring-red-500 font-semibold"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Tolak
              </Button>
              <Button
                size="sm"
                onClick={() => onOpenReviewModal('APPROVED')}
                disabled={isLoading}
                className="bg-primer hover:bg-primer-deep text-white font-semibold shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Setujui Kemitraan
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-netral-border">
        {/* Panel Kiri: Profil Bisnis & Legalitas */}
        <div className="lg:col-span-5 p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gelap/80 mb-3 flex items-center">
              <Building2 className="w-4 h-4 mr-1.5 text-primer" />
              Profil Entitas Usaha
            </h3>
            <div className="space-y-3.5 text-sm">
              <div>
                <span className="text-xs text-gelap/75 block">Nama Resmi Usaha:</span>
                <span className="font-bold text-gelap">{tenant.businessName}</span>
              </div>
              <div>
                <span className="text-xs text-gelap/75 block">Kategori Mitra:</span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-primer-light text-primer border border-primer/20">
                  {tenant.tenantType === 'HOREKA_BUYER' ? 'Pembeli HoReKa' : 'Pemasok Gapoktan'}
                </span>
              </div>
              <div>
                <span className="text-xs text-gelap/75 block">Sentra Produksi / Operasional:</span>
                <span className="flex items-center text-gelap font-semibold mt-0.5">
                  <MapPin className="w-4 h-4 mr-1 text-sekunder" />
                  Sentra {tenant.regency.replace('_', ' ')}, D.I. Yogyakarta
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-netral-border/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gelap/80 mb-3 flex items-center">
              <User className="w-4 h-4 mr-1.5 text-primer" />
              Penanggung Jawab Usaha
            </h3>
            <div className="space-y-3.5 text-sm">
              <div>
                <span className="text-xs text-gelap/75 block">Nama Lengkap:</span>
                <span className="font-semibold text-gelap">{tenant.owner.fullName}</span>
              </div>
              <div>
                <span className="text-xs text-gelap/75 block">Alamat Surel:</span>
                <a
                  href={`mailto:${tenant.owner.email}`}
                  className="flex items-center text-primer hover:underline font-semibold mt-0.5"
                >
                  <Mail className="w-4 h-4 mr-1.5 shrink-0" />
                  {tenant.owner.email}
                </a>
              </div>
              <div>
                <span className="text-xs text-gelap/75 block">Nomor WhatsApp:</span>
                <a
                  href={`tel:${tenant.owner.phoneNumber}`}
                  className="flex items-center text-primer hover:underline font-semibold mt-0.5"
                >
                  <Phone className="w-4 h-4 mr-1.5 shrink-0" />
                  {tenant.owner.phoneNumber}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Kanan: Berkas Legalitas KYB */}
        <div className="lg:col-span-7 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gelap/80 flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-primer" />
              Daftar Berkas Legalitas ({tenant.documents.length})
            </h3>
          </div>

          {tenant.documents.length === 0 ? (
            <div className="p-8 text-center bg-netral-canvas rounded-xl border border-dashed border-netral-border">
              <FileText className="w-8 h-8 mx-auto text-gelap/40 mb-2" />
              <p className="text-xs text-gelap/75">Belum ada dokumen legalitas yang diunggah.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tenant.documents.map((doc) => (
                <div
                  key={doc.documentId}
                  className="p-4 rounded-xl border border-netral-border hover:border-primer/60 transition-colors bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-primer-light text-primer border border-primer/20 flex-shrink-0">
                      <FileText className="w-5 h-5 text-primer" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gelap">Dokumen {doc.documentType}</span>
                        <StatusBadge status={doc.status} />
                      </div>
                      <p className="text-xs text-gelap/80 font-medium mt-0.5">Nomor: {doc.documentNumber}</p>
                      <p className="text-[11px] text-gelap/70 mt-0.5 flex items-center gap-1.5">
                        <span>Ukuran: {(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                        <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
                        <span>Format: {doc.fileMimeType}</span>
                      </p>
                    </div>
                  </div>
                  <div className="sm:self-center">
                    <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-lg bg-netral-canvas text-gelap/90 border border-netral-border">
                      Tersimpan di S3 MinIO
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
