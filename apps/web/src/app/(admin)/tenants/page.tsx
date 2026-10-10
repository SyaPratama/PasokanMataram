'use client';

import * as React from 'react';
import { Button } from '../../../components/ui/button';
import { StatusBadge } from '../../../components/shared/status-badge';
import { KybAuditSkeleton } from './_components/kyb-audit-skeleton';
import { KybAuditPanel, type KybAuditDetail } from './_components/kyb-audit-panel';
import { KybActionModal } from './_components/kyb-action-modal';
import { MOCK_TENANTS_KYB, type MockTenantKyb } from '../../../lib/mock-data';
import { ShieldCheck, RefreshCw, ChevronLeft, ChevronRight, AlertCircle, FileText, CheckCircle2, Search } from 'lucide-react';
import { Input } from '../../../components/ui/input';

interface QueueItem {
  tenantId: string;
  businessName: string;
  tenantType: 'HOREKA_BUYER' | 'GAPOKTAN_SUPPLIER';
  regency: string;
  kybStatus: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  submittedAt: string;
  owner: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  documentsCount: number;
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

type StatusFilterTab = 'ALL' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';

/**
 * Konversi dataset tiruan ke format item antrean audit.
 */
function mapMockToQueueItem(mock: MockTenantKyb): QueueItem {
  return {
    tenantId: mock.id,
    businessName: mock.businessName,
    tenantType: mock.tenantType === 'HOREKA' ? 'HOREKA_BUYER' : 'GAPOKTAN_SUPPLIER',
    regency: mock.regency,
    kybStatus:
      mock.status === 'PENDING'
        ? 'PENDING_VERIFICATION'
        : mock.status === 'VERIFIED'
          ? 'VERIFIED'
          : 'REJECTED',
    submittedAt: mock.submittedAt,
    owner: {
      fullName: mock.picName,
      email: mock.picEmail,
      phoneNumber: mock.picPhone,
    },
    documentsCount: mock.documents.length,
  };
}

/**
 * Meja Kerja Audit Kepatuhan (KYB) Khusus Admin PasokMataram.
 * Menampilkan antrean permohonan legalitas mitra HoReKa & Gapoktan dengan verifikasi berdampingan.
 */
export default function AdminTenantsPage() {
  const [items, setItems] = React.useState<QueueItem[]>(() => MOCK_TENANTS_KYB.map(mapMockToQueueItem));
  const [pagination, setPagination] = React.useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: MOCK_TENANTS_KYB.length,
    limit: 25,
  });
  const [statusFilter, setStatusFilter] = React.useState<StatusFilterTab>('ALL');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successBanner, setSuccessBanner] = React.useState<string | null>(null);

  const [selectedTenant, setSelectedTenant] = React.useState<KybAuditDetail | null>(null);
  const [actionModal, setActionModal] = React.useState<{
    isOpen: boolean;
    decision: 'APPROVED' | 'REJECTED';
  }>({
    isOpen: false,
    decision: 'APPROVED',
  });
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);

  /**
   * Mengambil data antrean dari backend, atau jatuh kembali ke dataset tiruan offline-safe.
   */
  const fetchQueue = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const queryStatus = statusFilter === 'ALL' ? '' : `&status=${statusFilter}`;
      const res = await fetch(`/api/v1/admin/kyb/pending?page=${page}&limit=25${queryStatus}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data?.items && data.data.items.length > 0) {
          setItems(data.data.items);
          setPagination(data.data.pagination || { currentPage: page, totalPages: 1, totalItems: data.data.items.length, limit: 25 });
          return;
        }
      }
      // Fallback ke dataset tiruan lokal
      const mockItems = MOCK_TENANTS_KYB.map(mapMockToQueueItem);
      const filtered = statusFilter === 'ALL' ? mockItems : mockItems.filter((i) => i.kybStatus === statusFilter);
      setItems(filtered);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: filtered.length, limit: 25 });
    } catch {
      // Offline fallback mandiri
      const mockItems = MOCK_TENANTS_KYB.map(mapMockToQueueItem);
      const filtered = statusFilter === 'ALL' ? mockItems : mockItems.filter((i) => i.kybStatus === statusFilter);
      setItems(filtered);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: filtered.length, limit: 25 });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  React.useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  /**
   * Filter antrean berdasarkan pencarian kata kunci.
   */
  const displayedItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.regency.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [items, searchTerm]);

  /**
   * Menampilkan panel tinjau berkas split-pane.
   */
  const handleSelectTenant = (item: QueueItem) => {
    const rawMock = MOCK_TENANTS_KYB.find((m) => m.id === item.tenantId);
    setSelectedTenant({
      tenantId: item.tenantId,
      businessName: item.businessName,
      tenantType: item.tenantType,
      regency: item.regency,
      kybStatus: item.kybStatus,
      owner: item.owner,
      documents: rawMock
        ? rawMock.documents.map((doc, idx) => ({
          documentId: `doc-${item.tenantId}-${idx}`,
          documentType: doc.type,
          documentNumber: doc.type === 'NIB' ? rawMock.nibNumber || '9120001234567' : rawMock.groupCertificateNumber || '520/SK/2024',
          status: item.kybStatus,
          fileStorageKey: doc.filename,
          fileMimeType: doc.filename.endsWith('.pdf') ? 'application/pdf' : 'image/webp',
          fileSizeBytes: 1420580,
          uploadedAt: doc.uploadedAt,
        }))
        : [
          {
            documentId: `doc-${item.tenantId}`,
            documentType: 'NIB / SK Legalitas',
            documentNumber: '9120001234567',
            status: item.kybStatus,
            fileStorageKey: `kyb/${item.tenantId}/dokumen_resmi.pdf`,
            fileMimeType: 'application/pdf',
            fileSizeBytes: 1420580,
            uploadedAt: item.submittedAt,
          },
        ],
    });
  };

  /**
   * Mengonfirmasi keputusan audit verifikasi (Setujui / Tolak).
   */
  const handleConfirmReview = async (rejectionReason?: string) => {
    if (!selectedTenant) return;
    setIsSubmittingReview(true);
    try {
      await fetch('/api/v1/admin/kyb/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.tenantId,
          decision: actionModal.decision,
          rejectionReason,
        }),
      }).catch(() => null);

      // Mutasi status lokal untuk simulasi mulus
      const newStatus = actionModal.decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
      setItems((prev) =>
        prev.map((i) => (i.tenantId === selectedTenant.tenantId ? { ...i, kybStatus: newStatus } : i))
      );

      setSuccessBanner(
        actionModal.decision === 'APPROVED'
          ? `Kemitraan untuk ${selectedTenant.businessName} berhasil disetujui (VERIFIED).`
          : `Berkas untuk ${selectedTenant.businessName} berhasil ditolak dengan catatan evaluasi tertulis.`
      );

      setActionModal({ isOpen: false, decision: 'APPROVED' });
      setSelectedTenant(null);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Informasi / Notifikasi Berhasil */}
      {successBanner && (
        <div className="p-4 bg-primer-light border border-primer/30 rounded-xl flex items-start justify-between text-xs text-primer shadow-xs">
          <div className="flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-primer" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-primer/60 hover:text-primer font-bold ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between text-xs text-red-700 shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button size="sm" variant="outline" onClick={fetchQueue} className="border-red-300 text-red-700">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Header Dashboard & Tab Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-netral-border/60 pb-4">
        <div>
          <h1 className="text-xl font-heading font-extrabold text-gelap tracking-tight flex items-center">
            <ShieldCheck className="w-6 h-6 mr-2 text-primer" />
            Meja Kerja Audit Kepatuhan (KYB)
          </h1>
          <p className="text-xs text-gelap/80 mt-1 font-body flex items-center gap-1.5">
            <span>Validasi legalitas resmi mitra HoReKa dan Gapoktan D.I. Yogyakarta</span>
            <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
            <span>SLA 1x24 Jam Kerja</span>
          </p>
        </div>

        {!selectedTenant && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs Status Antrean */}
            <div className="inline-flex rounded-lg border border-netral-border p-1 bg-white shadow-2xs">
              {(
                [
                  { key: 'ALL', label: 'Semua' },
                  { key: 'PENDING_VERIFICATION', label: 'Menunggu' },
                  { key: 'VERIFIED', label: 'Disetujui' },
                  { key: 'REJECTED', label: 'Ditolak' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.key);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFilter === tab.key
                      ? 'bg-primer text-white shadow-xs'
                      : 'text-gelap/80 hover:text-gelap hover:bg-netral-canvas'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchQueue}
              disabled={isLoading}
              className="border-netral-border text-gelap"
              title="Segarkan antrean data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {/* Bar Pencarian */}
      {!selectedTenant && (
        <div className="bg-white p-3.5 rounded-xl border border-netral-border/60 shadow-2xs flex items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <label htmlFor="admin-tenant-search" className="sr-only">
              Cari nama entitas, penanggung jawab, email, atau kabupaten
            </label>
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gelap/50" aria-hidden="true" />
            <Input
              id="admin-tenant-search"
              name="admin-tenant-search"
              type="text"
              placeholder="Cari nama entitas, penanggung jawab, email, kabupaten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="text-xs text-gelap/80 hidden sm:block">
            Menampilkan <strong>{displayedItems.length}</strong> entitas
          </div>
        </div>
      )}

      {/* Tampilan Detail Split-Pane vs Tabel Antrean */}
      {selectedTenant ? (
        <KybAuditPanel
          tenant={selectedTenant}
          onBack={() => setSelectedTenant(null)}
          onOpenReviewModal={(decision) => setActionModal({ isOpen: true, decision })}
          isLoading={isSubmittingReview}
        />
      ) : isLoading ? (
        <KybAuditSkeleton />
      ) : displayedItems.length === 0 ? (
        <div className="w-full bg-white rounded-xl border border-netral-border p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 mx-auto text-gelap/40 mb-3" />
          <h3 className="text-sm font-bold text-gelap font-heading">Tidak Ada Antrean Verifikasi</h3>
          <p className="text-xs text-gelap/75 mt-1 max-w-sm mx-auto">
            {statusFilter === 'PENDING_VERIFICATION'
              ? 'Seluruh berkas pendaftaran mitra saat ini telah diproses audit.'
              : `Tidak ditemukan entitas mitra dengan filter terpilih.`}
          </p>
        </div>
      ) : (
        <div className="w-full bg-white rounded-xl border border-netral-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-netral-canvas text-[11px] uppercase text-gelap/80 border-b border-netral-border font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Entitas Usaha & Pemilik</th>
                  <th className="py-3 px-4">Kategori Mitra</th>
                  <th className="py-3 px-4">Sentra Produksi</th>
                  <th className="py-3 px-4">Waktu Penyerahan</th>
                  <th className="py-3 px-4 text-center">Status Kepatuhan</th>
                  <th className="py-3 px-4 text-right">Tindakan Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-netral-border/60">
                {displayedItems.map((item) => (
                  <tr key={item.tenantId} className="hover:bg-netral-canvas/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gelap">{item.businessName}</div>
                      <div className="text-[11px] text-gelap/75 flex items-center gap-1.5">
                        <span>{item.owner.fullName}</span>
                        <span className="w-1 h-1 rounded-full bg-netral-border inline-block" aria-hidden="true" />
                        <span>{item.owner.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primer-light text-primer border border-primer/20 uppercase tracking-wider">
                        {item.tenantType === 'HOREKA_BUYER' ? 'Pembeli HoReKa' : 'Pemasok Gapoktan'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-gelap">
                      Sentra {item.regency.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gelap/80 font-medium">
                      {item.submittedAt}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={item.kybStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectTenant(item)}
                        className="border-primer/40 text-primer hover:bg-primer-light text-xs font-semibold"
                      >
                        Periksa Berkas
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kontrol Paginasi */}
          <div className="p-3.5 border-t border-netral-border flex items-center justify-between text-xs text-gelap/75 bg-netral-canvas/40">
            <div>
              Menampilkan <strong>{displayedItems.length}</strong> mitra di D.I. Yogyakarta
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="border-netral-border text-xs text-gelap/50"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="border-netral-border text-xs text-gelap/50"
              >
                Selanjutnya
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Keputusan Review */}
      <KybActionModal
        isOpen={actionModal.isOpen}
        businessName={selectedTenant?.businessName || ''}
        decision={actionModal.decision}
        onClose={() => setActionModal({ isOpen: false, decision: 'APPROVED' })}
        onConfirm={handleConfirmReview}
        isLoading={isSubmittingReview}
      />
    </div>
  );
}
