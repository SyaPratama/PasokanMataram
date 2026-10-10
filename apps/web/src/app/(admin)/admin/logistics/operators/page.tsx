'use client';

import * as React from 'react';
import {
  Truck,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Clock,
  MapPin,
  X,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { createHubOperatorAction } from '../../../../actions/operator-actions';

interface OperatorRow {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly assignedHubId: string;
  readonly microRole: 'OPERATOR_QC' | 'SUPERVISOR_HUB';
  readonly status: 'ACTIVE' | 'PENDING_ACTIVATION' | 'REVOKED';
  readonly createdAt: string;
}

const INITIAL_OPERATORS: readonly OperatorRow[] = [
  {
    id: 'op-001',
    fullName: 'Ahmad Suroso',
    email: 'ahmad.qc@hub-bantul.pasok.id',
    assignedHubId: 'hub-bantul-01',
    microRole: 'OPERATOR_QC',
    status: 'ACTIVE',
    createdAt: '2026-10-05',
  },
  {
    id: 'op-002',
    fullName: 'Tri Handoko',
    email: 'tri.spv@hub-sentolo.pasok.id',
    assignedHubId: 'hub-sentolo-01',
    microRole: 'SUPERVISOR_HUB',
    status: 'ACTIVE',
    createdAt: '2026-10-06',
  },
  {
    id: 'op-003',
    fullName: 'Bambang Irawan',
    email: 'bambang.irawan@hub-sleman.pasok.id',
    assignedHubId: 'hub-sleman-01',
    microRole: 'OPERATOR_QC',
    status: 'PENDING_ACTIVATION',
    createdAt: '2026-10-08',
  },
];

/**
 * Meja Kerja Super Admin Pengelolaan & Penerbitan Operator Hub Logistik Tertutup.
 * Mematuhi FR-020 dan Konstitusi Prinsip XIII.
 */
export default function LogisticsOperatorsPage() {
  const [operators, setOperators] = React.useState<readonly OperatorRow[]>(INITIAL_OPERATORS);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [assignedHubId, setAssignedHubId] = React.useState('hub-bantul-01');
  const [microRole, setMicroRole] = React.useState<'OPERATOR_QC' | 'SUPERVISOR_HUB'>('OPERATOR_QC');
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [issuedResult, setIssuedResult] = React.useState<{
    activationUrl: string;
    token: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleOpenModal = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setAssignedHubId('hub-bantul-01');
    setMicroRole('OPERATOR_QC');
    setFormError(null);
    setIssuedResult(null);
    setCopied(false);
    setModalOpen(true);
  };

  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const result = await createHubOperatorAction({
        fullName,
        email,
        phoneNumber,
        assignedHubId,
        microRole,
      });

      if (!result.success || !result.data) {
        setFormError(result.message || 'Gagal menerbitkan akun operator');
        return;
      }

      const newOp: OperatorRow = {
        id: result.data.operatorId,
        fullName,
        email,
        assignedHubId,
        microRole,
        status: 'PENDING_ACTIVATION',
        createdAt: new Date().toISOString().split('T')[0] || '2026-10-09',
      };

      setOperators((prev) => [newOp, ...prev]);
      setIssuedResult({
        activationUrl: result.data.activationUrl,
        token: result.data.activationToken,
        expiresAt: result.data.expiresAt,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setFormError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (issuedResult && typeof navigator !== 'undefined') {
      const fullUrl = `${window.location.origin}${issuedResult.activationUrl}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-body">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-netral-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-gelap">
              Operator Logistik Fasilitas Hub
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer uppercase">
              Jalur Tertutup
            </span>
          </div>
          <p className="text-xs text-gelap/65 mt-1">
            Penerbitan akun staf QC dan Supervisor fisik cross-docking hub DIY dengan ikatan fasilitas kaku.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleOpenModal}
          className="text-xs font-bold bg-primer text-white hover:bg-primer-dark shadow-sm h-10 px-4 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Terbitkan Operator Baru
        </Button>
      </div>

      {/* Tabel Operator Hub */}
      <div className="bg-white rounded-2xl border border-netral-border/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-netral-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-gelap">
            <Building2 className="w-4 h-4 text-primer" />
            <span>Daftar Operator Terdaftar ({operators.length})</span>
          </div>
          <span className="text-[11px] text-gelap/60">
            Terikat kaku ke Fasilitas Fisik DIY
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-netral-canvas/60 text-gelap/70 font-semibold border-b border-netral-border">
              <tr>
                <th className="p-3.5">Nama Operator</th>
                <th className="p-3.5">Surel Akun</th>
                <th className="p-3.5">Fasilitas Hub Fisik</th>
                <th className="p-3.5">Wewenang Role</th>
                <th className="p-3.5">Status Aktivasi</th>
                <th className="p-3.5">Tanggal Terbit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60 text-gelap">
              {operators.map((op) => (
                <tr key={op.id} className="hover:bg-netral-canvas/30 transition-colors">
                  <td className="p-3.5 font-bold text-gelap">
                    {op.fullName}
                  </td>
                  <td className="p-3.5 font-mono text-gelap/80">
                    {op.email}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-netral-canvas border border-netral-border text-xs font-medium text-gelap">
                      <MapPin className="w-3 h-3 text-sekunder" />
                      {op.assignedHubId}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        op.microRole === 'SUPERVISOR_HUB'
                          ? 'bg-sekunder/15 text-sekunder'
                          : 'bg-primer-light text-primer'
                      }`}
                    >
                      {op.microRole}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        op.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {op.status === 'ACTIVE' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {op.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-gelap/60">
                    {op.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog Penerbitan Operator */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-netral-border relative">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gelap/50 hover:text-gelap hover:bg-netral-canvas"
            >
              <X className="w-5 h-5" />
            </button>

            {!issuedResult ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-primer" />
                  <h2 className="text-lg font-bold font-heading text-gelap">
                    Penerbitan Akun Operator Hub
                  </h2>
                </div>
                <p className="text-xs text-gelap/65 mb-4 leading-relaxed">
                  Akun operator terikat secara kaku pada fasilitas fisik dan wajib diaktivasi mandiri dalam 24 jam.
                </p>

                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateOperator} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gelap mb-1">
                      Nama Lengkap Operator
                    </label>
                    <Input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Muhammad Arif Wibowo"
                      className="w-full text-xs h-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gelap mb-1">
                        Alamat Surel
                      </label>
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="arif.qc@hub.id"
                        className="w-full text-xs h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gelap mb-1">
                        Nomor WhatsApp
                      </label>
                      <Input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="081234567890"
                        className="w-full text-xs h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gelap mb-1">
                        Fasilitas Hub Fisik Terikat
                      </label>
                      <select
                        value={assignedHubId}
                        onChange={(e) => setAssignedHubId(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-white border border-netral-border rounded-lg text-gelap focus:outline-none focus:ring-1 focus:ring-primer"
                      >
                        <option value="hub-bantul-01">Hub Bantul Paseban</option>
                        <option value="hub-sentolo-01">Hub Sentolo Agropark</option>
                        <option value="hub-sleman-01">Hub Sleman Kalirang KM 9</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gelap mb-1">
                        Tingkat Wewenang
                      </label>
                      <select
                        value={microRole}
                        onChange={(e) => setMicroRole(e.target.value as 'OPERATOR_QC' | 'SUPERVISOR_HUB')}
                        className="w-full h-10 px-3 text-xs bg-white border border-netral-border rounded-lg text-gelap focus:outline-none focus:ring-1 focus:ring-primer"
                      >
                        <option value="OPERATOR_QC">OPERATOR_QC (Scan QR & Timbang)</option>
                        <option value="SUPERVISOR_HUB">SUPERVISOR_HUB (Otorisasi Selisih & Reject)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-10 text-xs font-bold rounded-xl bg-primer text-white hover:bg-primer-dark"
                    >
                      {isLoading ? 'Menerbitkan...' : 'Terbitkan Akun (Token 24 Jam)'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalOpen(false)}
                      className="h-10 text-xs rounded-xl"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold font-heading text-gelap">
                  Akun Operator Berhasil Diterbitkan!
                </h2>
                <p className="text-xs text-gelap/70 leading-relaxed">
                  Bagikan tautan aktivasi mandiri di bawah kepada operator. Tautan ini hanya berlaku selama <strong className="text-gelap">24 jam</strong>.
                </p>

                <div className="p-3 bg-netral-canvas rounded-xl border border-netral-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gelap">Tautan Aktivasi Mandiri:</span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primer hover:underline"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Tersalin!' : 'Salin Tautan'}
                    </button>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-netral-border font-mono text-[11px] break-all text-gelap/80 select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}${issuedResult.activationUrl}` : issuedResult.activationUrl}
                  </div>
                  <div className="text-[10px] text-gelap/60 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sekunder" />
                    Kedaluwarsa: {new Date(issuedResult.expiresAt).toLocaleString('id-ID')}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full h-10 text-xs font-bold rounded-xl bg-primer text-white hover:bg-primer-dark"
                >
                  Selesai
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
