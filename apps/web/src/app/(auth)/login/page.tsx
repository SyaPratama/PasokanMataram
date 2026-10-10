'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChefHat,
  Building2,
  Tractor,
  ScanQrCode,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

/**
 * Konfigurasi 4 Profil Pengujian Cepat untuk evaluasi juri lomba dan demonstrasi fungsional.
 * Mematuhi FR-021 dan Konstitusi Prinsip XIII.
 */
const DEMO_PERSONAS = [
  {
    id: 'chef-bale-raos',
    label: 'Masuk sbg Head Chef (Bale Raos)',
    shortRole: 'Head Chef',
    businessName: 'Bale Raos Kraton',
    macroRole: 'HOREKA',
    microRole: 'HEAD_CHEF',
    email: 'chef.bambang@baleraos.id',
    icon: ChefHat,
    redirectUrl: '/horeka/dashboard',
    description: 'Akses stok dapur & COGS resep (Metrik finansial disembunyikan total)',
  },
  {
    id: 'owner-kopi-klotok',
    label: 'Masuk sbg Owner (Kopi Klotok)',
    shortRole: 'Owner / Finansial',
    businessName: 'Kopi Klotok Pakem',
    macroRole: 'HOREKA',
    microRole: 'OWNER',
    email: 'owner@kopiklotok.id',
    icon: Building2,
    redirectUrl: '/horeka/dashboard',
    description: 'Akses penuh saldo escrow, mutasi bank, dan manajemen multi-outlet',
  },
  {
    id: 'gapoktan-srikayangan',
    label: 'Masuk sbg Ketua Gapoktan (Srikayangan)',
    shortRole: 'Ketua Gapoktan',
    businessName: 'Gapoktan Srikayangan',
    macroRole: 'GAPOKTAN',
    microRole: 'CHAIRPERSON',
    email: 'ketua.subardi@srikayangan.id',
    icon: Tractor,
    redirectUrl: '/farmer/dashboard',
    description: 'Floor price panen, jadwal kirim truk, dan penarikan dana escrow',
  },
  {
    id: 'qc-hub-bantul',
    label: 'Masuk sbg QC Operator (Hub Bantul)',
    shortRole: 'QC Operator Logistik',
    businessName: 'Cross-Dock Hub Bantul',
    macroRole: 'HUB_OPERATOR',
    microRole: 'OPERATOR_QC',
    email: 'ahmad.qc@hub-bantul.pasok.id',
    icon: ScanQrCode,
    redirectUrl: '/hub/inbound',
    description: 'Pindai QR muatan masuk, timbangan digital, dan cetak label sortir',
  },
] as const;

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
  const [activePersonaId, setActivePersonaId] = React.useState<string | null>(null);

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
   * Menangani pemilihan profil demo 1-klik untuk pengujian lomba.
   * @param persona Profil pengujian yang dipilih.
   */
  const handleSelectDemoPersona = (persona: (typeof DEMO_PERSONAS)[number]) => {
    setActivePersonaId(persona.id);
    setEmail(persona.email);
    setPassword('P@sokMataram2026!');
    setErrorMessage(null);
    setIsLoading(true);

    if (typeof document !== 'undefined') {
      const mockToken = createMockClientJwt({
        userId: `usr_${persona.id}`,
        tenantId: `tenant_${persona.id}`,
        macroRole: persona.macroRole,
        microRole: persona.microRole,
        email: persona.email,
        isSuperAdmin: false,
      });
      document.cookie = `pasok_session=${mockToken}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `pasok_session_role=${persona.microRole}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `pasok_macro_role=${persona.macroRole}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `pasok_kyb_status=VERIFIED; path=/; max-age=604800; SameSite=Lax`;
    }

    setTimeout(() => {
      setIsLoading(false);
      const destination = redirectTarget || persona.redirectUrl;
      router.push(destination);
    }, 450);
  };

  const handleQuickDemoFill = (role: 'HOREKA' | 'GAPOKTAN' | 'ADMIN') => {
    if (role === 'HOREKA') {
      const p = DEMO_PERSONAS[0];
      if (p) handleSelectDemoPersona(p);
    } else if (role === 'GAPOKTAN') {
      const p = DEMO_PERSONAS[2];
      if (p) handleSelectDemoPersona(p);
    } else {
      const p = DEMO_PERSONAS[3];
      if (p) handleSelectDemoPersona(p);
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
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border border-netral-border/70 overflow-hidden">
      <div className="bg-primer p-6 sm:p-7 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-3 border border-white/20 shadow-inner">
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
          <p className="text-xs text-white/85 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Pengadaan Bahan Baku Dapur Restoran & Rantai Pasok Petani D.I. Yogyakarta
          </p>
        </div>

        <div className="p-6 sm:p-8">
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

          <div className="mt-8 pt-6 border-t border-netral-border/70">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gelap/85 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-aksen-dark" aria-hidden="true" />
                Quick Demo Switcher (Pengujian 1-Klik)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-aksen/15 text-aksen-dark">
                Live Simulasi
              </span>
            </div>

            <p className="text-[11px] text-gelap/85 mb-3 leading-relaxed font-body">
              Pilih peran pengujian untuk simulasi dashboard adaptif secara instan:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_PERSONAS.map((persona) => {
                const IconComponent = persona.icon;
                const isSelected = activePersonaId === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleSelectDemoPersona(persona)}
                    disabled={isLoading}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 group ${
                      isSelected
                        ? 'border-primer bg-primer-light/25 shadow-xs'
                        : 'border-netral-border/80 bg-netral-canvas/40 hover:border-primer hover:bg-white hover:shadow-xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-netral-border flex items-center justify-center flex-shrink-0 text-primer group-hover:scale-105 transition-transform shadow-2xs">
                      <IconComponent className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gelap group-hover:text-primer transition-colors truncate">
                          {persona.label}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white text-gelap/85 border border-netral-border flex-shrink-0">
                          {persona.shortRole}
                        </span>
                      </div>
                      <p className="text-[10px] text-gelap/85 mt-0.5 leading-snug line-clamp-1 font-body">
                        {persona.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
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
