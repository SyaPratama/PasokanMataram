'use client';

import * as React from 'react';
import { Plus, Mail } from 'lucide-react';
import { z } from 'zod';

const TeamMemberSchema = z.object({ id: z.string(), name: z.string(), email: z.string(), role: z.string(), status: z.string() });
const TeamResponseSchema = z.object({ success: z.boolean(), data: z.array(TeamMemberSchema) });
type TeamMember = z.infer<typeof TeamMemberSchema>;

export default function BuyerTeamPage() {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/v1/buyer/team')
      .then(async (response) => {
        if (!response.ok) throw new Error('Data tim tidak tersedia.');
        const parsed = TeamResponseSchema.safeParse(await response.json());
        if (!parsed.success || !parsed.data.success) throw new Error('Respons tim tidak valid.');
        setTeamMembers(parsed.data.data);
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : 'Data tim tidak tersedia.');
        setTeamMembers([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-xl sm:text-2xl font-heading font-extrabold text-gelap tracking-tight">Tim Restoran & Pembagian Wewenang Peran</h1><p className="text-xs sm:text-sm text-gelap/70 mt-1">Daftar akun tenant pembeli dari basis data.</p></div>
        <button type="button" disabled className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primer/50 text-white text-xs font-bold min-h-[44px] shadow-sm"><Plus className="w-4 h-4" /><span>Undang Anggota Tim</span></button>
      </div>
      {errorMessage && <div className="p-5 rounded-2xl bg-status-danger/10 border border-status-danger/30 text-sm text-status-danger">{errorMessage}</div>}
      <div className="bg-white border border-netral-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-netral-border/70 flex items-center justify-between"><h2 className="text-sm font-heading font-bold text-gelap">Akun Tenant Pembeli</h2><span className="text-xs text-gelap/60 font-mono">{isLoading ? 'Memuat' : `${teamMembers.length} Akun`}</span></div>
        {isLoading ? <div className="p-8 text-center text-sm text-gelap/70 animate-pulse">Memuat akun tersimpan...</div> : teamMembers.length === 0 ? <div className="p-8 text-center text-sm text-gelap/70">Belum ada akun tim tersimpan.</div> : <div className="overflow-x-auto"><table className="w-full text-left border-collapse text-xs"><thead><tr className="bg-netral-canvas/60 border-b border-netral-border text-gelap/60 font-semibold uppercase tracking-wider text-[10px]"><th className="py-3 px-4">Nama & Email</th><th className="py-3 px-4">Peran</th><th className="py-3 px-4">Cakupan Akses</th><th className="py-3 px-4 text-center">Status</th></tr></thead><tbody className="divide-y divide-netral-border/60">{teamMembers.map((member) => <tr key={member.id} className="hover:bg-netral-canvas/40 transition-colors"><td className="py-3.5 px-4"><div className="font-bold text-gelap">{member.name}</div><div className="text-[11px] text-gelap/60 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3 text-gelap/40" />{member.email}</div></td><td className="py-3.5 px-4"><span className="font-semibold text-primer bg-primer-light/60 px-2 py-0.5 rounded text-[11px]">{member.role}</span></td><td className="py-3.5 px-4 text-gelap/70">Mengikuti kebijakan peran tersimpan.</td><td className="py-3.5 px-4 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primer-light text-primer">{member.status}</span></td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}
