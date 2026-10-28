'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Utensils,
  Store,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import type { DIYRegency } from '@pasok/domain';

type RegistrationIntent = 'HOREKA' | 'GAPOKTAN';

/**
 * Halaman Pendaftaran Akun Dual-Track dengan Account Intent Switcher.
 * Dirancang ramah semua kalangan usia (senior-friendly) dengan touch target >= 48px,
 * kontras tinggi, dan istilah operasional lugas.
 * Mematuhi FR-001, FR-019, dan Konstitusi Prinsip XIII.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [intent, setIntent] = React.useState<RegistrationIntent>('HOREKA');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    businessName: '',
    regency: 'SLEMAN' as DIYRegency,
    ownerName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Helper untuk membuat token mock JWT berbasis Base64 Web API native.
   */
  const createMockClientJwt = (claims: {
    userId: string;
    tenantId: string;
    macroRole: string;
    microRole: string;
    email: string;
    isSuperAdmin?: boolean;
  }) => {
    try {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      const payload = btoa(
        JSON.stringify({
          ...claims,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 7 * 86400,
        })
      )
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      return `${header}.${payload}.mock_sig_${Date.now()}`;
    } catch {
      return `mock.session.${claims.microRole}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        businessName: formData.businessName,
        tenantType: intent === 'HOREKA' ? 'HOREKA_BUYER' : 'GAPOKTAN_SUPPLIER',
        macroRole: intent,
        regency: formData.regency,
        ownerName: formData.ownerName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      };

      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setErrorMessage(errorData.message || 'Gagal mendaftar. Silakan coba lagi.');
        return;
      }

      const data = await res.json();
      if (data.success && data.data) {
        const { tenantId, userId, role, kybStatus } = data.data;

        if (typeof document !== 'undefined') {
          const mockToken = createMockClientJwt({
            userId,
            tenantId,
            macroRole: intent,
            microRole: intent === 'HOREKA' ? 'OWNER' : 'CHAIRPERSON',
            email: formData.email || 'mitra@pasokmataram.id',
            isSuperAdmin: false,
          });
          document.cookie = `pasok_session=${mockToken}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `pasok_session_role=${intent === 'HOREKA' ? 'OWNER' : 'CHAIRPERSON'}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `pasok_macro_role=${intent}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `pasok_kyb_status=${kybStatus || 'KYB_PENDING'}; path=/; max-age=604800; SameSite=Lax`;
        }

        const targetDashboard = intent === 'HOREKA' ? '/buyer/dashboard' : '/supplier/dashboard';
        router.push(targetDashboard);
        return;
      }

      setErrorMessage('Respons server tidak valid.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat mendaftar.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-md border border-netral-border/80 overflow-hidden p-6 sm:p-8">
      <div className="bg-gradient-to-b from-primer-deep to-primer rounded-2xl p-5 sm:p-6 text-white text-center mb-6 shadow-xs relative">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-3">
          <Image
            src="/icons/icon.svg"
            alt="Logo PasokMataram"
            width={48}
            height={48}
            className="w-12 h-12 object-contain"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-balance">
          Pendaftaran Entitas Usaha PasokMataram
        </h1>
        <p className="text-xs text-white/90 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Daftarkan bisnis Anda untuk bergabung dengan ekosistem pangan D.I. Yogyakarta
        </p>
      </div>

      <div className="flex mb-6 bg-netral-canvas/50 rounded-2xl p-1 border border-netral-border/40">
        <button
          type="button"
          onClick={() => setIntent('HOREKA')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
            intent === 'HOREKA'
              ? 'bg-primer text-white shadow-sm'
              : 'text-gelap/70 hover:text-gelap'
          }`}
          aria-pressed={intent === 'HOREKA'}
        >
          <Utensils className="w-4 h-4" />
          Kafe & Restoran
        </button>
        <button
          type="button"
          onClick={() => setIntent('GAPOKTAN')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
            intent === 'GAPOKTAN'
              ? 'bg-sekunder text-white shadow-sm'
              : 'text-gelap/70 hover:text-gelap'
          }`}
          aria-pressed={intent === 'GAPOKTAN'}
        >
          <Store className="w-4 h-4" />
          Kelompok Tani
        </button>
      </div>

      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-3.5 rounded-xl bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-businessName" className="block text-xs sm:text-sm font-semibold text-gelap uppercase tracking-wider mb-1.5">
            {intent === 'HOREKA' ? 'Nama Restoran / Usaha Kuliner' : 'Nama Kelompok Tani / Gapoktan'}
          </label>
          <Input
            id="reg-businessName"
            name="businessName"
            autoComplete="organization"
            required
            value={formData.businessName}
            onChange={handleChange}
            placeholder={intent === 'HOREKA' ? 'Contoh: Bale Raos Resto & Cafe…' : 'Contoh: Gapoktan Srikayangan Sentolo…'}
            className="w-full text-sm min-h-[48px] rounded-xl"
          />
        </div>

        <div>
          <label htmlFor="reg-regency" className="block text-xs sm:text-sm font-semibold text-gelap uppercase tracking-wider mb-1.5">
            Kabupaten / Kota
          </label>
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gelap/50 pointer-events-none" aria-hidden="true" />
            <select
              id="reg-regency"
              name="regency"
              required
              value={formData.regency}
              onChange={handleChange}
              className="w-full text-sm min-h-[48px] rounded-xl border-netral-border/40 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primer/20 appearance-none"
            >
              <option value="SLEMAN">Sleman</option>
              <option value="BANTUL">Bantul</option>
              <option value="GUNUNG KIDUL">Gunung Kidul</option>
              <option value="KULON PROGO">Kulon Progo</option>
              <option value="KOTA YOGYA">Kota Yogyakarta</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="reg-ownerName" className="block text-xs sm:text-sm font-semibold text-gelap uppercase tracking-wider mb-1.5">
            Nama Pemilik / Ketua
          </label>
          <Input
            id="reg-ownerName"
            name="ownerName"
            autoComplete="name"
            required
            value={formData.ownerName}
            onChange={handleChange}
            placeholder="Contoh: Budi Santoso…"
            className="w-full text-sm min-h-[48px] rounded-xl"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-xs sm:text-sm font-semibold text-gelap uppercase tracking-wider mb-1.5">
            Alamat Surel
          </label>
          <Input
            id="reg-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="nama@bisnis-kuliner.id…"
            className="w-full text-sm min-h-[48px] rounded-xl"
          />
        </div>

        <div>
          <label htmlFor="reg-phoneNumber" className="block text-xs sm:text-sm font-semibold text-gelap uppercase tracking-wider mb-1.5">
            Nomor WhatsApp
          </label>
          <Input
            id="reg-phoneNumber"
            type="tel"
            name="phoneNumber"
            autoComplete="tel"
            required
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="0812-3456-7890"
            className="w-full text-sm min-h-[48px] rounded-xl"
          />
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-xs sm:text-sm font-semibold text-gelap uppercase tracking-wider mb-1.5">
            Kata Sandi
          </label>
          <Input
            id="reg-password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimal 8 karakter"
            className="w-full text-sm min-h-[48px] rounded-xl"
          />
          <p className="mt-1.5 text-[10px] text-gelap/60">
            Gunakan kombinasi huruf besar, huruf kecil, dan angka untuk keamanan maksimal.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[48px] text-sm font-bold rounded-xl bg-primer text-white hover:bg-primer-hover transition-all shadow-sm"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2 animate-spin" aria-hidden="true"></span>
              Mendaftarkan…
            </>
          ) : (
            <>
              Daftar Sekarang
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gelap/60">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primer font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-netral-border/30">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primer mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="text-xs font-bold text-gelap mb-1">Keamanan Terjamin</h3>
            <p className="text-[10px] text-gelap/65 leading-relaxed">
              Data usaha Anda dilindungi dengan enkripsi end-to-end dan kebijakan privasi ketat.
              Tidak ada biaya tersembunyi untuk pendaftaran.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
