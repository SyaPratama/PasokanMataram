import type { Metadata } from 'next';
import { Users, Shield, Plus, Mail } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/status-badge';

export const metadata: Metadata = {
  title: 'Tim & Wewenang Peran Gerai | Portal HoReKa PasokMataram',
  description: 'Manajemen hak akses role-adaptive staf dapur, purchasing, manajer gerai, dan pemilik usaha.',
};

/**
 * Halaman Manajemen Tim & Wewenang HoReKa.
 */
export default function BuyerTeamPage() {
  const teamMembers = [
    {
      id: 'usr-001',
      name: 'Ibu Sri Rejeki',
      email: 'owner@baleraos.id',
      role: 'OWNER',
      roleLabel: 'Pemilik Usaha (Owner)',
      accessLevel: 'Akses Penuh Finansial & KYB',
      status: 'VERIFIED' as const,
    },
    {
      id: 'usr-002',
      name: 'Chef Bambang S.',
      email: 'chef@baleraos.id',
      role: 'HEAD_CHEF',
      roleLabel: 'Kepala Dapur (Head Chef)',
      accessLevel: 'Standing Order, Ceklis QC, Stok Dapur',
      status: 'VERIFIED' as const,
    },
    {
      id: 'usr-003',
      name: 'Sdr. Dian Prasetyo',
      email: 'purchasing@baleraos.id',
      role: 'PURCHASING',
      roleLabel: 'Staf Pengadaan (Purchasing)',
      accessLevel: 'Katalog, Buat PO, Terima Pengantaran Subuh',
      status: 'VERIFIED' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">
            Tim Restoran & Pembagian Wewenang Peran
          </h1>
          <p className="text-xs sm:text-sm text-gelap/70 mt-1">
            Role-adaptive dashboard membatasi visibilitas saldo finansial dan KYB hanya untuk akun yang berwenang.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primer text-white text-xs font-bold hover:bg-primer-hover min-h-[44px] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Undang Anggota Tim Baru</span>
        </button>
      </div>

      <div className="bg-white border border-netral-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-netral-border/70 flex items-center justify-between">
          <h2 className="text-sm font-heading font-bold text-gelap">
            Staf Terdaftar Gerai Pusat Bale Raos
          </h2>
          <span className="text-xs text-gelap/60 font-mono">
            {teamMembers.length} Akun Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-netral-canvas/60 border-b border-netral-border text-gelap/60 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Nama Staf & Email</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Cakupan Akses Sistem</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-netral-border/60">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-netral-canvas/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gelap">{member.name}</div>
                    <div className="text-[11px] text-gelap/60 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-gelap/40" />
                      {member.email}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-primer bg-primer-light/60 px-2 py-0.5 rounded text-[11px]">
                      {member.roleLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gelap/70">
                    {member.accessLevel}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={member.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
