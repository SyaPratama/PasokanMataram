import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Kebijakan Privasi | PasokMataram',
  description: 'Kebijakan privasi dan perlindungan data PasokMataram',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-netral-canvas">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-primer hover:text-primer-hover mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        <h1 className="text-3xl font-bold font-heading text-gelap mb-2">
          Kebijakan Privasi
        </h1>
        <p className="text-sm text-gelap/70 mb-8">Terakhir diperbarui: 3 November 2026</p>

        <div className="bg-white rounded-2xl border border-netral-border p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">1. Pengumpulan Data</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              Kami mengumpulkan informasi yang Anda berikan saat registrasi, verifikasi KYB, dan transaksi: nama bisnis, NIB, NPWP, alamat, kontak, dan dokumen legalitas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">2. Penggunaan Data</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              Data digunakan untuk: (a) Verifikasi identitas bisnis, (b) Pemrosesan transaksi dan pembayaran, (c) Penyampaian notifikasi logistik, (d) Audit kepatuhan regulasi pangan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">3. Keamanan Data</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              Data dilindungi dengan enkripsi TLS 1.3, Row-Level Security (RLS) multi-tenant, dan penyimpanan dokumen terenkripsi melalui Appwrite Storage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">4. Berbagi Data</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              Kami tidak menjual data pribadi. Data dibagikan hanya kepada: (a) Solosmartpay untuk pemrosesan pembayaran, (b) Partner logistik untuk pengiriman, (c) Otoritas berwenang jika diwajibkan hukum.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">5. Hak Pengguna</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              Anda berhak mengakses, mengubah, dan menghapus data pribadi. Hubungi privacy@pasokmataram.id untuk permintaan terkait data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">6. Cookies</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              Kami menggunakan cookies untuk autentikasi sesi dan preferensi pengguna. Tidak ada cookies pelacakan pihak ketiga.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
