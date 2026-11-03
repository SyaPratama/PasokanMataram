import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Syarat dan Ketentuan | PasokMataram',
  description: 'Syarat dan ketentuan penggunaan platform PasokMataram',
};

export default function TermsPage() {
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
          Syarat dan Ketentuan
        </h1>
        <p className="text-sm text-gelap/70 mb-8">Terakhir diperbarui: 3 November 2026</p>

        <div className="bg-white rounded-2xl border border-netral-border p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">1. Penerimaan Syarat</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              Dengan mengakses dan menggunakan platform PasokMataram, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">2. Layanan</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              PasokMataram menyediakan platform pengadaan bahan baku pangan yang menghubungkan restoran, hotel, kafe (HoReKa) dengan supplier lokal D.I. Yogyakarta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">3. Pembayaran</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              Pembayaran dilakukan melalui gateway Solosmartpay dengan metode QRIS, Virtual Account, dan e-wallet. Biaya layanan 0,3% untuk pembeli dan 0,5% untuk merchant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">4. Verifikasi KYB</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              Seluruh entitas bisnis wajib menyelesaikan verifikasi Know Your Business (KYB) sebelum melakukan transaksi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">5. Batasan Tanggung Jawab</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              PasokMataram tidak bertanggung jawab atas sengketa kualitas produk antara pembeli dan supplier. Mekanisme quality control dan dispute resolution tersedia melalui platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-heading text-gelap mb-3">6. Kontak</h2>
            <p className="text-sm text-gelap/85 leading-relaxed">
              Untuk pertanyaan terkait syarat dan ketentuan, hubungi: legal@pasokmataram.id
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
