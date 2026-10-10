# PasokMataram

Platform orkestrasi rantai pasok pangan agrikultur terpadu untuk wilayah Daerah Istimewa Yogyakarta. Sistem ini menghubungkan pelaku usaha kuliner Hotel, Restoran, dan Kafe (HoReKa) secara langsung dengan Gabungan Kelompok Tani (Gapoktan) melalui sentra hub logistik pangan dan jadwal pengantaran subuh.

---

## Fitur dan Modul Utama

### 1. Portal HoReKa (Pembeli Bahan Baku)
- Ringkasan Dapur: Pemantauan ketersediaan stok bahan segar, jadwal drop subuh 04:30 WIB, dan alokasi pool kuota.
- Manajemen Multi-Gerai: Pengelolaan cabang operasional di 5 wilayah kabupaten dan kota se-DIY (Kota Yogyakarta, Sleman, Bantul, Kulon Progo, Gunungkidul).
- Prediksi Harga Pangan: Simulasi proyeksi harga komoditas pangan unggulan berdasarkan data historis dan tren musim tanam.
- Pengadaan Rutin: Pengaturan jadwal kirim bahan baku dapur (Standing Orders), alur pengantaran subuh, dan verifikasi mutu dapur (QC Dapur).

### 2. Portal Gapoktan (Pemasok Hasil Tani)
- Meja Kerja Panen: Pencatatan komitmen jadwal panen, kapasitas tonase, dan alokasi pasok ke sentra hub logistik.
- Alur Logistik: Pengelolaan serah terima komoditas, pengecekan mutu kadar air dan sortasi panen (QC Cross-Dock Hub), serta distribusi sentra pasar.
- Kemitraan Terlindungi: Akses data komitmen pengadaan terikat kontrak dengan transparansi alokasi dana escrow.

### 3. Otentikasi dan Onboarding KYB (Know Your Business)
- Pendaftaran akun berbasis verifikasi legalitas resmi (Nomor Induk Berusaha / NIB untuk HoReKa dan Surat Keputusan Penetapan Kelompok Tani untuk Gapoktan).
- Penyimpanan berkas terisolasi menggunakan MinIO Object Storage dengan presigned URL.
- Meja kerja verifikasi admin untuk pemeriksaan kepatuhan dan alur remediasi dokumen perbaikan.

---

## Arsitektur Monorepo

Repositori ini dikelola menggunakan Turborepo dengan struktur modul terpisah:

```text
pasokmataram/
├── apps/
│   └── web/                     Aplikasi Next.js App Router (Antarmuka HoReKa, Gapoktan, Admin, dan Publik)
├── packages/
│   ├── config/                  Konfigurasi sistem, skema Zod terpusat, dan token tema warna resmi
│   ├── database/                Koneksi pool PostgreSQL 16 dan isolasi Row-Level Security (withTenantContext)
│   ├── domain/                  Entitas murni bisnis, Branded Types, dan skema validasi data
│   ├── queue/                   Kontrak pengiriman pesan antrean asinkron fail-fast
│   └── security/                Enkripsi Argon2id, pembuatan token sesi, dan resolver peran edge
├── services/
│   ├── auth-kyb-service/        Layanan mikro verifikasi identitas dan presigner MinIO
│   └── queue-worker/            Pekerja latar belakang pemrosesan dokumen dan notifikasi
├── specs/                       Spesifikasi teknis, dokumen rencana, tugas kerja, dan checklist mutu
└── tests/                       Suite pengujian Vitest (Unit, Integration, Contract, dan E2E)
```

---

## Standar Desain dan Antarmuka

Antarmuka dibangun dengan aturan desain ketat sesuai panduan proyek:
- Sistem Cangkang Modular (DashboardShell): Struktur tata letak dasbor terpadu dengan slot konteks gerai dan mitra kelompok tani yang dapat dipertukarkan.
- Sidebar Ergonomis: Lebar desktop w-72 (288px) dengan pengguliran vertikal mandiri (overflow-y-auto) yang terkunci di viewport, serta jarak pemisah lapang pada status tenant.
- Palet Warna Resmi: Menggunakan token warna tema terdaftar (@pasok/config) berbasis warna alam Mataram (Daun Tropis `#2E5339`, Bata Mataram `#B85324`, Sinar Senja `#D48028`, Rimbun Alam `#6E8B6E`, Tanah Jawa `#4A3525`, dan Laras Alami `#E6D7C3`).
- Aksesibilitas WCAG 2.1 AA: Rasio kontras teks minimal 4.5:1 terhadap latar belakang dan ukuran area sentuh interaktif minimal 44x44px.
- Bebas Karakter Emotikon: Seluruh simbol visual menggunakan pustaka ikon resmi Lucide Icons (lucide-react).

---

## Prasyarat Lingkungan

Pastikan perangkat kerja telah terpasang:
- Node.js versi 20 LTS atau lebih baru
- npm versi 10 atau lebih baru
- PostgreSQL versi 16 (opsional untuk lingkungan live database)
- Redis versi 7 (opsional untuk distributed mutex lock)
- MinIO atau S3-compatible storage (opsional untuk penyimpanan dokumen)

Catatan: Proyek ini dilengkapi hermetic mock dataset bawaan sehingga seluruh antarmuka frontend dan suite pengujian dapat dijalankan tanpa ketergantungan basis data eksternal yang sedang aktif.

---

## Panduan Instalasi dan Menjalankan Proyek

1. Kloning repositori:
```bash
git clone https://github.com/iniradif/PasokMataram.git
cd PasokMataram
```

2. Pasang dependensi monorepo:
```bash
npm install
```

3. Salin berkas konfigurasi lingkungan (jika diperlukan untuk koneksi layanan penuh):
```bash
cp .env.example .env
```

4. Jalankan server pengembangan lokal:
```bash
npm run dev
```

Aplikasi antarmuka web dapat diakses melalui peramban di alamat:
`http://localhost:3000`

---

## Menjalankan Pengujian Otomatis

Proyek ini mengadopsi strategi Test-Driven Development (TDD) dengan suite pengujian Vitest:

- Menjalankan seluruh pengujian:
```bash
npm test
```

- Menjalankan pengujian berbasis Turborepo:
```bash
npm run test:turbo
```

- Menjalankan pengujian alur antarmuka dan E2E:
```bash
npm run test:e2e
```

- Memeriksa keabsahan tipe TypeScript:
```bash
npm run lint
```
atau
```bash
npx --prefix apps/web tsc --noEmit
```

---

## Lisensi dan Hak Cipta

Hak Cipta (c) 2026 PasokMataram. Hak cipta dilindungi undang-undang.
