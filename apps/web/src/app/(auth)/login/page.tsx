/**
 * @file apps/web/src/app/(auth)/login/page.tsx
 * @description Halaman Masuk Terpadu (Unified Login) untuk semua role PasokMataram.
 * Menggunakan backend authentication real melalui TenantService.authenticateUser().
 * Mematuhi Konstitusi Prinsip VI (Multi-tenant security) dan FR-018.
 */

import dynamic from 'next/dynamic';

const LoginContent = dynamic(() => import('./login-content'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primer/30 border-t-primer rounded-full animate-spin"></div>
    </div>
  ),
});

export default function LoginPage() {
  return <LoginContent />;
}
