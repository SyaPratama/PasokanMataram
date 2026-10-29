# PasokMataram

**Platform Pooling Purchasing Pangan B2B untuk Restoran & Supplier UMKM DIY**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

---

## 🎯 Problem Statement

Rantai pasok pangan di DIY menghadapi 3 masalah kritis:

1. **Harga tinggi dengan markup 40-60%** - Restoran/katering membeli dengan kuota kecil, tidak bisa negosiasi harga grosir
2. **Transaksi tidak aman** - Bayar dimuka tanpa jaminan, risiko fraud tinggi, cash flow tidak terprediksi
3. **Kualitas tidak konsisten** - Tidak ada standar QC, dispute sulit diselesaikan

---

## 💡 Solution: Pooling + Escrow + QC Hub

**PasokMataram** menghadirkan platform B2B yang menggabungkan 3 inovasi:

### 1. Pooling Purchasing (Group Buying)
- Agregasi pesanan multi-restoran untuk capai **Minimum Transaction Value (MTV) Rp 500.000**
- Harga turun **20-40%** karena volume grosir langsung dari produsen
- Supplier dapat planning produksi lebih baik dengan order terkonfirmasi

### 2. Escrow Bank BPD DIY
- Pembayaran ditahan di rekening escrow bank sampai QC lolos
- **Dual-rail fee model**: 0.3% buyer service fee + 0.5% merchant platform fee
- Auto-disbursement **H+1** setelah verifikasi kualitas

### 3. QC Hub dengan Timbangan Tera Digital
- Stasiun timbangan **tera SNI** di hub logistik
- Foto timestamp dengan **watermark otomatis** (metadata + geotag)
- Toleransi defisit ≤5% (standar industri), excess → dispute investigation

**Bonus: ML Price Forecasting** - Prediksi harga komoditas minggu depan (LightGBM multivariat)

---

## 🏗️ Architecture

### Microservices Monorepo (Turborepo)

```
PasokMataram/
├── apps/
│   ├── web/                    # Next.js 14 App Router (BFF + Presentasi)
│   └── api/                    # NestJS Gateway (Router ke services)
├── services/
│   ├── auth-kyb-service/       # Identity, KYB verification, MinIO S3 presigner
│   ├── pooling-service/        # Reservasi kuota, MTV validation, Redlock
│   ├── logistics-hub-service/  # Timbangan tera, QC dispute, SNI cold chain
│   ├── settlement-service/     # Escrow BPD DIY, Solosmartpay gateway
│   ├── queue-worker/           # Background jobs (fail-fast events)
│   └── ml-forecasting-service/ # FastAPI + LightGBM (price prediction)
├── packages/
│   ├── domain/                 # Pure domain entities (Branded Types + Zod)
│   ├── database/               # PostgreSQL pool + RLS tenant context
│   ├── config/                 # Centralized config (Zod validated)
│   └── queue/                  # Message broker contracts (fail-fast)
└── docs/
    ├── DATABASE.md             # ER diagram + schema docs
    └── API.md                  # Swagger/OpenAPI spec (generated)
```

### Tech Stack

**Frontend:**
- **Next.js 14** (App Router, React Server Components)
- **Tailwind CSS** + Design system tokens (Daun Tropis, Baru Mataram)
- **Lucide Icons** (no emoji mentah)
- **Plus Jakarta Sans** + Inter + JetBrains Mono

**Backend:**
- **NestJS 10** (Microservices gateway)
- **PostgreSQL 16** (RLS multi-tenant, Branded Type UUIDs)
- **Redis 7** (Cache + rate limiting + distributed lock)
- **MinIO** (S3-compatible object storage)

**Payment:**
- **Solosmartpay** (QRIS EMVCo + VA multi-bank)
- **Escrow BPD DIY** (rekening penampungan resmi)

**ML/AI:**
- **FastAPI** + **LightGBM** (price forecasting)
- **Python 3.11** (scikit-learn, pandas)

**DevOps:**
- **Docker Compose** (local development)
- **Turborepo** (monorepo build orchestration)
- **GitHub Actions** (CI/CD pipeline)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ LTS
- **Docker** + Docker Compose
- **Git**

### Local Development

```bash
# Clone repository
git clone https://github.com/SyaPratama/PasokanMataram.git
cd PasokanMataram

# Install dependencies
npm install

# Start Docker services (PostgreSQL, Redis, MinIO, ML service)
docker-compose up -d

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev

# Open browser
# - Web: http://localhost:3000
# - API: http://localhost:3001
# - Swagger: http://localhost:3001/api
# - Adminer: http://localhost:8080
# - MinIO Console: http://localhost:9001
```

### Environment Variables

Copy `.env.example` → `.env` dan sesuaikan:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pasokmataram_db
DB_USER=root
DB_PASSWORD=Tama123

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret (CRITICAL: ganti di production)
JWT_SECRET=rahasia-kunci-otentikasi-jwt-pasokmataram-local-dev-32chars

# MinIO S3
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_PRIVATE=kyb-documents-private

# Solosmartpay
SOLOSMARTPAY_API_TOKEN=ssp_test_pasokmataram_demo
SOLOSMARTPAY_WEBHOOK_SECRET=ssp_secret_default_key

# ML Service
ML_FORECAST_URL=http://localhost:8765
```

---

## 📚 Documentation

- **[Database Schema (ER Diagram)](docs/DATABASE.md)** - Struktur tabel, relasi, indexes
- **[API Documentation](http://localhost:3001/api)** - Swagger UI (auto-generated)
- **[Architecture Decision Records](docs/ADR/)** - Design decisions & rationale
- **[Security Audit Report](C:/Users/inira/security-audit-skill/PasokMataram/run-1/REPORT.md)** - Penetration test findings

---

## 🔐 Security

**Production-ready security posture:**

✅ **Authentication & Authorization**
- JWT HS256 dengan signature validation (`jose` library)
- Argon2id password hashing (memory-hard, GPU-resistant)
- Multi-tenant RLS (Row-Level Security) enforcement

✅ **Input Validation**
- Zod schema validation (client + server)
- Parameterized SQL queries (no SQL injection)
- React auto-escape (XSS prevention)

✅ **File Upload Security**
- Magic byte validation (`file-type` library)
- MIME type whitelist (PDF, JPEG, PNG, WebP only)
- File size limit 5 MB

✅ **Rate Limiting**
- Redis-based: 5 login attempts/15min, 100 API req/min
- Upload throttling: 10 files/hour

✅ **Webhook Security**
- HMAC-SHA256 signature validation
- Replay protection (Redis nonce + 5min timestamp window)

✅ **Production Headers**
- Content-Security-Policy
- X-Frame-Options: DENY
- Strict-Transport-Security
- X-Content-Type-Options: nosniff

---

## 🎨 Design System

**PasokMataram Heritage Design Tokens:**

- **Primer (Daun Tropis)**: `#2E5339` - Trust, sustainability, nature
- **Sekunder (Baru Mataram)**: `#B85324` - Heritage, warmth, craftsmanship
- **Aksen (Sinar Senja)**: `#D48028` - Opportunity, optimism, prosperity
- **Pendukung (Rimbun Alam)**: `#6E8B6E` - Growth, balance, freshness

**Compliance:**
- WCAG 2.1 AA (contrast ratio 4.5:1 minimum)
- Keyboard navigation support
- Screen reader labels (ARIA)
- Touch targets 44x44px minimum

**Typography:**
- Heading: Plus Jakarta Sans (700/800)
- Body: Inter (400/500/600)
- Code: JetBrains Mono (400/500)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# E2E tests (Playwright)
npm run test:e2e
```

**Test Coverage Target:** 70% for critical paths

---

## 📦 Build & Deployment

### Production Build

```bash
# Build all packages
npm run build

# Output:
# - apps/web/.next/ (Next.js production build)
# - apps/api/dist/ (NestJS compiled)
# - services/*/dist/ (Microservices compiled)
```

### Docker Production Image

```bash
# Build production image
docker build -t pasokmataram-web:latest -f apps/web/Dockerfile .
docker build -t pasokmataram-api:latest -f apps/api/Dockerfile .

# Run production containers
docker-compose -f docker-compose.prod.yml up -d
```

### Deployment Platforms

**Recommended:**
- **Frontend (Next.js)**: Vercel, Netlify, Railway
- **Backend (NestJS)**: Railway, Render, DigitalOcean App Platform
- **Database**: Supabase, Neon, Railway PostgreSQL
- **Redis**: Upstash, Redis Cloud
- **Storage**: Cloudflare R2, AWS S3, DigitalOcean Spaces

**Shared Hosting (via SSH):**
- See `.github/workflows/deploy.yml` for CI/CD setup
- Requires: Node.js 20+, PM2, Nginx reverse proxy

---

## 🤝 Contributing

**Code Style:**
- TypeScript strict mode (no `any`)
- ESLint + Prettier enforced
- Conventional Commits
- PR requires review + CI passing

**Development Workflow:**
1. Create feature branch: `feat/pooling-campaign-ui`
2. Make changes, commit with conventional format
3. Run `npm test` and `npm run build` locally
4. Push and create PR
5. Wait for CI checks + code review

---

## 📊 Business Model

**Revenue Streams:**

1. **Platform Fee (0.5% merchant)**: Charged to suppliers per transaction
2. **Service Fee (0.3% buyer)**: Transparent fee shown at checkout
3. **Premium Features** (future): Priority pooling slots, extended payment terms
4. **Data Insights** (future): ML forecasting API for enterprise clients

**Unit Economics:**

- Average Order Value (AOV): Rp 2.000.000
- Platform fee: Rp 10.000 (0.5%) + Rp 6.000 (0.3%) = Rp 16.000/order
- Target: 1.000 orders/month = Rp 16.000.000 GMV
- Break-even: ~500 orders/month (infrastructure cost ~Rp 8.000.000)

---

## 🗺️ Roadmap

**Q4 2026 (Current):**
- ✅ MVP Pooling + Escrow + QC Hub
- ✅ KYB verification workflow
- ✅ ML price forecasting
- 🚧 Mobile-responsive UI polish

**Q1 2027:**
- Expand ke Solo & Semarang (200+ UMKM target)
- B2C marketplace pilot (direct to consumer)
- Mobile app (React Native) untuk supplier di lapangan

**Q2 2027:**
- Cold chain logistics tracking (IoT sensor suhu)
- Smart contract escrow (blockchain settlement)
- Multi-language support (EN, ID)

**Q3 2027:**
- Pan-Jawa expansion (Jakarta, Surabaya, Bandung)
- API marketplace untuk fintech/ERP integration
- White-label platform for agri-corps

---

## 📄 License

**Proprietary** - All rights reserved by PasokMataram Team

For licensing inquiries: [contact information placeholder]

---

## 📞 Contact

**Development Team:**
- GitHub: [SyaPratama/PasokanMataram](https://github.com/SyaPratama/PasokanMataram)
- Email: [team email placeholder]

**Competition:**
- GTNIC 2026 Web Development Category
- Garda Tech National Innovation Competition

---

## 🙏 Acknowledgments

- **Garda Tech** - Platform kompetisi & mentorship
- **BPD DIY** - Escrow banking partnership
- **Solosmartpay** - Payment gateway integration
- **BAPANAS & PIHPS** - Historical price data sources

---

**Built with ❤️ for UMKM Indonesia by PasokMataram Team**
