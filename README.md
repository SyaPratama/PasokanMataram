# PasokMataram

Platform Pooling Purchasing Pangan B2B untuk Restoran, Kafe, Katering, dan Supplier UMKM D.I. Yogyakarta.

---

## 1. Ringkasan Eksekutif & Pernyataan Masalah

Rantai pasok bahan baku pangan komersial di Daerah Istimewa Yogyakarta menghadapi tiga kendala struktural:

1. **Disparitas Harga & Tingginya Markup Perantara (40% - 60%)**: Pelaku usaha kuliner (HoReKa) membeli dalam skala kecil secara sporadis tanpa akses ke harga grosir langsung dari petani atau gabungan kelompok tani (Gapoktan).
2. **Ketiadaan Jaminan Transaksi Finansial**: Pola bayar di muka rawan wanprestasi dan fraud, sedangkan sistem pembayaran tempo berisiko kredit macet bagi petani kecil.
3. **Fluktuasi Kualitas & Ketiadaan Kalibrasi Fisik**: Tidak adanya standar inspeksi kualitas (QC) terpusat, pengujian rantai dingin (cold chain), dan stasiun tera digital legal menyebabkan tingginya sengketa susut timbangan.

---

## 2. Solusi Terintegrasi PasokMataram

PasokMataram mengintegrasikan tiga pilar operasional utama:

### A. Pooling Purchasing (Group Buying Agregatif)
- Agregasi pesanan harian multi-restoran untuk memenuhi **Minimum Transaction Value (MTV) Rp 500.000**.
- Mengurangi harga pokok pengadaan bahan hingga **20% - 40%** langsung dari sentra produksi pangan Sleman, Bantul, dan Kulon Progo.
- Petani memperoleh kepastian serapan hasil panen dengan pesanan terkonfirmasi di muka.

### B. Rekening Escrow Bank BPD DIY & Solosmartpay Gateway
- Pembayaran pembeli ditampung secara aman pada **Rekening Escrow Bank BPD DIY** hingga verifikasi timbangan dan mutu selesai dilakukan.
- **Model Biaya Transaksi Berimbang (Dual-Rail Fee)**: Biaya layanan sistem 0.3% sisi pembeli dan biaya platform 0.5% sisi merchant/pemasok.
- **Pencairan Otomatis H+1**: Dana dicairkan langsung ke rekening kelompok tani setelah barang lolos uji tera dan diterima di dapur pembeli.

### C. Stasiun Timbangan Tera Digital Hub Logistik
- Validasi fisik berat menggunakan stasiun timbangan **Metrologi Legal SNI** di hub logistik transit.
- Toleransi susut alami standar industri (maksimal 5%); defisit melebihi toleransi langsung memicu penahanan dana escrow dan penerbitan pengembalian dana prorata ke pembeli.

### D. Prakiraan Harga Komoditas (Machine Learning Forecasting)
- Integrasi layanan mandiri FastAPI dan model LightGBM Direct Multi-Horizon (H+1 s/d H+7) untuk memproyeksikan tren harga 10 komoditas pangan DIY dengan akurasi terverifikasi (MAPE < 2.6%).

---

## 3. Arsitektur Monorepo & Struktur Direktori

Repositori dikelola menggunakan **Turborepo** dengan pemisahan domain bisnis yang ketat:

```text
PasokMataram/
├── apps/
│   ├── web/                    # Next.js 14 App Router (BFF, PWA, Presentasi Dapur Basah)
│   └── api/                    # NestJS 10 Gateway Microservices
├── services/
│   ├── auth-kyb-service/       # Identitas, verifikasi legalitas KYB, & token sesi
│   ├── pooling-service/        # Agregasi kuota panen, validasi MTV, & distributed lock
│   ├── logistics-hub-service/  # Stasiun timbangan tera, SNI cold chain, & QC dispute
│   ├── settlement-service/     # Rekening escrow BPD DIY & gateway Solosmartpay
│   └── queue-worker/           # Background event listener & auto-disbursement H+1
├── packages/
│   ├── domain/                 # Entitas murni domain, Branded Types, & validasi Zod
│   ├── database/               # MySQL 8.0 pool, RLS tenant context, & migrator
│   ├── config/                 # Konfigurasi terpusat terikat skema Zod
│   ├── queue/                  # Kontrak antrean pesan fail-fast
│   └── security/               # Argon2id, JWT HS256 (jose), & Edge claims
├── docker/                     # Konfigurasi container image (web, api, worker)
├── docs/                       # Dokumentasi arsitektur, basis data, & API
└── scripts/                    # Skrip migrasi, sandbox reset, & audit kebersihan
```

---

## 4. Tumpukan Teknologi (Technology Stack)

### Antarmuka & Frontend
- **Framework**: Next.js 14.2 (App Router, React Server Components, Server Actions)
- **Styling**: Tailwind CSS dengan token desain resmi Daun Tropis & Baru Mataram
- **Ikonografi**: Lucide Icons (Nol emotikon / karakter emoji mentah pada kode produksi)
- **Tipografi**: Plus Jakarta Sans (heading), Inter (body/tabel), JetBrains Mono (kode)
- **Aset & PWA**: Service Worker mandiri, manifest web, kompresi format WebP

### Layanan Backend & Basis Data
- **API Gateway**: NestJS 10 dengan Express engine dan TypeScript ketat (strict mode, zero `any`)
- **Basis Data Utama**: MySQL 8.0 (Normalisasi 3NF, connection pool `mysql2`, isolasi multi-tenant)
- **Cache & Mutex Lock**: Redis 7 (Mendukung TCP port `6379` dan Unix Domain Socket `unix:///...` cPanel)
- **Penyimpanan Berkas Legalitas**: MinIO / S3 Object Storage API dengan presigned URL

### Payment Gateway & Perbankan
- **Gateway**: Solosmartpay (QRIS dinamis EMVCo, Virtual Account BPD DIY, Mandiri, BRI, BCA, BNI, BSI)
- **Penampungan Dana**: Rekening Escrow Terpadu Bank BPD DIY

### Deployment & Runtime
- **Shared Hosting / Production**: LiteSpeed Web Server, Phusion Passenger, Node.js 20 LTS
- **Build Mode**: Next.js Standalone Output (artefak produksi murni tanpa kode sumber mentah)
- **Kontainerisasi**: Docker & Docker Compose untuk orkestrasi lingkungan pengembang

---

## 5. Menjalankan Proyek Secara Lokal

### Prasyarat Sistem
- Node.js 20.x LTS
- npm 10+ atau npm 11+
- Git
- MySQL 8.0 (lokal atau Docker)
- Redis 7 (lokal atau Docker)

### Langkah Instalasi

1. **Klon Repositori**:
   ```bash
   git clone https://github.com/SyaPratama/PasokanMataram.git
   cd PasokanMataram
   ```

2. **Pasang Dependensi Monorepo**:
   ```bash
   npm install
   ```

3. **Inisialisasi Berkas Lingkungan**:
   ```bash
   chmod +x setup-env.sh
   ./setup-env.sh development
   ```
   Salin nilai dari `.env.development.example` ke `.env.development` atau `.env.local`.

4. **Jalankan Migrasi Basis Data**:
   ```bash
   npm run db:migrate
   ```

5. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```

6. **Akses Layanan**:
   - Web Portal: `http://localhost:3000`
   - API Gateway: `http://localhost:3001`
   - Dokumentasi API (Swagger): `http://localhost:3001/api`

---

## 6. Standar Desain Sistem & Kepatuhan Kode

Seluruh kontribusi kode pada repositori PasokMataram wajib mematuhi aturan ketat dalam `AGENTS.md`:

1. **Nol Toleransi Emoji & Karakter Unicode Dekoratif**:
   - Dilarang keras menggunakan emotikon, smiley, karakter checklist unicode, atau simbol grafis mentah di antarmuka, kode sumber, label tombol, dan dokumentasi aturan. Seluruh elemen visual wajib menggunakan pustaka resmi `lucide-react`.
2. **Kepatuhan Token Desain Heritage Mataram**:
   - Primer (Daun Tropis): `primer` (`#2E5339`), `primer-hover` (`#24422D`), `primer-light` (`#EAF0EB`), `primer-deep` (`#1B3622`).
   - Sekunder (Baru Mataram): `sekunder` (`#B85324`), `sekunder-hover` (`#9E451D`), `sekunder-light` (`#F8EDE7`).
   - Aksen (Sinar Senja): `aksen` (`#D48028`), `aksen-hover` (`#BA6E1E`), `aksen-light` (`#FAF2E8`).
   - Status Semantik: `status-success` (`#2E5339`), `status-warning` (`#9A5814`), `status-danger` (`#B91C1C`).
   - Dilarang menyisipkan arbitrary hex (`bg-[#...]`, `text-[#...]`) di dalam kode antarmuka.
3. **Higienitas Komentar Kode**:
   - Dilarang menggunakan komentar baris tunggal (`//`) atau blok bebas (`/* */`) di kode produksi.
   - Seluruh simbol publik wajib didokumentasikan menggunakan blok JSDoc standar (`/** ... */`).
   - Skrip verifikasi: `node scripts/audit-cleanliness.mjs`.
4. **Aksesibilitas WCAG 2.1 AA**:
   - Rasio kontras teks minimal 4.5:1 untuk teks normal dan 3:1 untuk elemen grafis.
   - Ukuran target sentuh interaktif minimal 44x44px (direkomendasikan 48x48px).

---

## 7. Mode Pemeliharaan (Maintenance Mode)

Sistem dilengkapi kontrol mode pemeliharaan terpadu yang dapat diaktifkan melalui berkas konfigurasi lingkungan (`.env.production` atau `.env.development`):

- **Aktivasi**: Set `MAINTENANCE_MODE=true` di lingkungan server.
- **Kustomisasi**:
  - `MAINTENANCE_TITLE`: Judul pemeliharaan.
  - `MAINTENANCE_MESSAGE`: Deskripsi pekerjaan infrastruktur.
  - `MAINTENANCE_ESTIMATED_END`: Estimasi waktu penyelesaian.
  - `MAINTENANCE_BYPASS_TOKEN`: Token rahasia bagi pengembang untuk tetap dapat mengakses dasbor operasional saat pemeliharaan berlangsung (`/?bypass=<token>`).
- **Respon Otomatis**:
  - Akses halaman web publik dialihkan (*redirect*) ke `/maintenance` dengan badge dinamis mode hosting.
  - Endpoint API (`/api/*`) mengembalikan respons HTTP `503 Service Unavailable` berstandar `Retry-After: 3600`.

---

## 8. Alur Deployment Shared Hosting (cPanel & LiteSpeed)

Deployment produksi ke server shared hosting diotomatisasi melalui GitHub Actions (`.github/workflows/deploy.yml`):

1. **Pure Build Artifacts Only**:
   - Runner GitHub Actions mengompilasi bundel mandiri Next.js (`apps/web/.next/standalone`) dan bundling API NestJS (`apps/api/dist/main.js`).
   - Tidak ada kode sumber TypeScript mentah (`.ts`, `.tsx`, `src/`) yang dikirim ke server hosting.
2. **Eliminasi Eksekusi Paket di Remote**:
   - Server hosting tidak perlu mengeksekusi `npm install` atau `npm ci`, menghilangkan risiko kesalahan `npm: command not found` (exit code 127).
3. **Preservasi `.htaccess` & Proteksi Berkas Sensitif**:
   - Konfigurasi LiteSpeed Phusion Passenger otomatis dipertahankan.
   - Aturan keamanan memblokir seluruh akses web publik ke berkas `.env`, `.env.*`, dan `.git`.
4. **Pemicu Reload Otomatis**:
   - Eksekusi sentuhan berkas `touch "$WEB_PATH/tmp/restart.txt"` memicu LiteSpeed memuat ulang runtime aplikasi seketika tanpa perlu merestart server.

---

## 9. Pengujian & Verifikasi Kualitas

```bash
# Menjalankan seluruh pengujian unit & kontrak terisolasi
npm test -- --exclude='tests/e2e/**'

# Menjalankan audit kebersihan komentar dan ketiadaan emoji
node scripts/audit-cleanliness.mjs

# Menjalankan pemeriksaan kompilasi TypeScript ketat
npm run lint

# Menjalankan kompilasi penuh 14 paket monorepo
npm run build
```

---

## 10. Lisensi & Hak Cipta

Hak Cipta (c) 2026 Tim Pengembang PasokMataram. Seluruh hak cipta dilindungi undang-undang.
Platform ini dikembangkan untuk digitalisasi dan efisiensi pengadaan pangan usaha kuliner D.I. Yogyakarta.
