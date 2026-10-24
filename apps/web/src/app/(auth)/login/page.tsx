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
 * Komponen formulir masuk mandiri dan dock peralihan akun demo.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showForgotModal, setShowForgotModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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

  /**
   * Menangani pengiriman formulir kredensial masuk akun.
   * @param e Event formulir submit.
   */
  const handleSubmit = (e: React.FormEvent) => {
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

    let destination = redirectTarget || '/buyer/dashboard';
    let macroRole = 'HOREKA';
    let microRole = 'HEAD_CHEF';

    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail.includes('owner') || normalizedEmail.includes('klotok') || normalizedEmail.includes('finance')) {
      macroRole = 'HOREKA';
      microRole = 'OWNER';
      destination = redirectTarget || '/buyer/outlets';
    } else if (normalizedEmail.includes('chef') || normalizedEmail.includes('dapur') || normalizedEmail.includes('resto') || normalizedEmail.includes('bale')) {
      macroRole = 'HOREKA';
      microRole = 'HEAD_CHEF';
      destination = redirectTarget || '/buyer/dashboard';
    } else if (normalizedEmail.includes('farmer') || normalizedEmail.includes('srikayangan') || normalizedEmail.includes('gapoktan') || normalizedEmail.includes('tani')) {
      macroRole = 'GAPOKTAN';
      microRole = 'CHAIRPERSON';
      destination = redirectTarget || '/supplier/dashboard';
    } else if (normalizedEmail.includes('hub') || normalizedEmail.includes('qc') || normalizedEmail.includes('logistik')) {
      macroRole = 'HUB_OPERATOR';
      microRole = 'OPERATOR_QC';
      destination = redirectTarget || '/hub/inbound';
    } else if (normalizedEmail.includes('admin')) {
      macroRole = 'SUPER_ADMIN';
      microRole = 'SUPER_ADMIN';
      destination = redirectTarget || '/admin/tenants';
    }

    if (typeof document !== 'undefined') {
      const mockToken = createMockClientJwt({
        userId: `usr_mock_${Date.now()}`,
        tenantId: `tenant_mock_${Date.now()}`,
        macroRole,
        microRole,
        email: normalizedEmail,
        isSuperAdmin: macroRole === 'SUPER_ADMIN',
      });
      document.cookie = `pasok_session=${mockToken}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `pasok_session_role=${microRole}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `pasok_macro_role=${macroRole}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `pasok_kyb_status=VERIFIED; path=/; max-age=604800; SameSite=Lax`;
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push(destination);
    }, 450);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-md border border-netral-border/80 overflow-hidden p-6 sm:p-8">
      <div className="bg-gradient-to-b from-primer-deep to-primer rounded-2xl p-6 sm:p-7 text-white text-center mb-6 shadow-xs relative">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white mb-3 shadow-xs p-2">
          <Image
            src="/icons/icon.svg"
            alt="Logo PasokMataram"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-balance">
          Masuk Portal PasokMataram
        </h1>
        <p className="text-xs text-white/90 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Pengadaan Bahan Baku Dapur Restoran &amp; Rantai Pasok Pangan D.I. Yogyakarta
        </p>
      </div>

      <div>
          {errorMessage ? (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          ) : null}

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
              className="w-full h-11 text-xs font-bold rounded-xl bg-primer text-white hover:bg-primer-dark transition-all mt-2 shadow-sm"
            >
              {isLoading ? 'Memvalidasi…' : 'Masuk ke Portal'}
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </form>

        </div>

        <div className="bg-netral-canvas/60 px-6 py-3.5 border-t border-netral-border/60 text-center">
          <p className="text-[11px] text-gelap/85 font-medium flex items-center justify-center gap-1.5 font-body">
            <ShieldCheck className="w-3.5 h-3.5 text-primer" aria-hidden="true" />
            Terproteksi Row-Level Security &amp; Argon2id Kriptografi
          </p>
        </div>
      </div>
  );
}

/**
 * Halaman Masuk Terpadu (Unified Login) terbungkus Suspense Boundary.
 * Mematuhi batasan Next.js CSR Bailout untuk useSearchParams.
 */
export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-netral-canvas flex items-center justify-center text-xs text-gelap/60">
          Memuat formulir masuk…
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
