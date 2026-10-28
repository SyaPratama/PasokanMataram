'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

/**
 * Halaman Masuk Terpadu (Unified Login) untuk semua role PasokMataram.
 * Menggunakan backend authentication real melalui TenantService.authenticateUser().
 * Mematuhi Konstitusi Prinsip VI (Multi-tenant security) dan FR-018.
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Silakan masukkan alamat surel akun Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Silakan masukkan kata sandi akun Anda.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setErrorMessage(errorData.message || 'Kredensial tidak valid.');
        return;
      }

      const data = await res.json();
      if (data.success && data.data) {
        const { tenantId, userId, role, macroRole } = data.data;

        if (typeof document !== 'undefined') {
          document.cookie = `pasok_session=${data.sessionToken || ''}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `pasok_session_role=${role}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `pasok_macro_role=${macroRole}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `pasok_kyb_status=VERIFIED; path=/; max-age=604800; SameSite=Lax`;
        }

        let destination = redirectTarget || '/buyer/dashboard';

        if (macroRole === 'SUPER_ADMIN') {
          destination = '/admin/tenants';
        } else if (macroRole === 'HUB_OPERATOR') {
          destination = '/hub/inbound';
        } else if (macroRole === 'GAPOKTAN') {
          destination = '/supplier/dashboard';
        } else if (macroRole === 'HOREKA' && role === 'OWNER') {
          destination = '/buyer/outlets';
        }

        router.push(destination);
      } else {
        setErrorMessage('Respons server tidak valid.');
      }
    } catch (err: unknown) {
      setErrorMessage('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-md border border-netral-border/80 overflow-hidden p-6 sm:p-8">
      <div className="bg-gradient-to-b from-primer-deep to-primer rounded-2xl p-6 sm:p-7 text-white text-center mb-6 shadow-xs relative">
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
          Masuk Portal PasokMataram
        </h1>
        <p className="text-xs text-white/90 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Pengadaan Bahan Baku Dapur Restoran &amp; Rantai Pasok Pangan D.I. Yogyakarta
        </p>
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
          <label htmlFor="login-email" className="block text-xs font-semibold text-gelap uppercase tracking-wider mb-1.5">
            Alamat Surel
          </label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@bisnis-kuliner.id…"
            className="w-full text-xs h-11"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold text-gelap uppercase tracking-wider">
              Kata Sandi
            </label>
            <Link
              href="/register"
              className="text-[11px] text-sekunder hover:underline font-semibold"
            >
              Belum punya akun?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi aman…"
              className="w-full text-xs h-11 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gelap/60 hover:text-gelap min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primer"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-xs font-bold rounded-xl bg-primer text-white hover:bg-primer-hover transition-all mt-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2 animate-spin" aria-hidden="true"></span>
              Memvalidasi…
            </>
          ) : (
            <>
              Masuk ke Portal
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="bg-netral-canvas/60 px-6 py-3.5 border-t border-netral-border/60 text-center">
        <p className="text-[11px] text-gelap/85 font-medium flex items-center justify-center gap-1.5 font-body">
          <ShieldCheck className="w-3.5 h-3.5 text-primer" aria-hidden="true" />
          Terproteksi Sistem Enkripsi &amp; Keamanan Data Usaha
        </p>
      </div>
    </div>
  );
}
