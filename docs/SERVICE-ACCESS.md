# Service Access Patterns & Architecture

## Overview

Dokumentasi cara akses services di PasokMataram setelah partial monolith consolidation.

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser/Mobile)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              apps/web (Next.js 14 App Router)                │
│                     BFF Layer + SSR                          │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                     │
│  • /api/v1/payments/*      → HTTP Proxy to apps/api        │
│  • /api/v1/webhooks/*      → Direct handler (external)      │
│  • /api/v1/forecast/*      → HTTP Proxy to apps/api        │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            apps/api (NestJS Monolith Gateway)                │
│                    Port: 4000                                │
├─────────────────────────────────────────────────────────────┤
│  Consolidated Services (Inline):                             │
│  • auth/              Auth + KYB + Appwrite                 │
│  • settlement/        Solosmartpay Client                   │
│                                                              │
│  Service Wrappers (Lightweight):                             │
│  • pooling/           → @pasok/pooling-service              │
│  • logistics/         → @pasok/logistics-hub-service        │
│  • forecast/          → HTTP to ml-forecasting-service      │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────────┐  ┌────────────────────┐
│  pooling-    │  │  logistics-hub-  │  │ ml-forecasting-    │
│  service     │  │  service         │  │ service            │
│  (TS/Node)   │  │  (TS/Node)       │  │ (Python FastAPI)   │
│  Port: N/A   │  │  Port: N/A       │  │ Port: 8000         │
│  (Direct     │  │  (Direct         │  │ (HTTP External)    │
│   Import)    │  │   Import)        │  │                    │
└──────────────┘  └──────────────────┘  └────────────────────┘
```

---

## 1. Akses Pattern: Consolidated Services (Inline)

### Auth & KYB Service

**Location**: `apps/api/src/auth/auth.service.ts`

**Direct Access** (No HTTP):
```typescript
// In NestJS Controller
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kyb-upload')
  async getUploadUrl(@Body() body) {
    return this.authService.getKybUploadUrl(
      body.tenantId,
      body.documentType,
      body.fileName,
      body.contentType
    );
  }
}
```

**Access Flow**:
```
Client → apps/web → HTTP → apps/api/auth → AuthService (inline)
```

### Settlement Service (Solosmartpay)

**Location**: `apps/api/src/settlement/settlement.service.ts`

**Access from Web BFF**:
```typescript
// apps/web/src/app/api/v1/payments/solosmartpay/route.ts
const response = await fetch(`${API_BASE_URL}/api/settlement/invoice`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken}`,
  },
  body: JSON.stringify({
    amount: 500000,
    reference: 'ORDER-001',
    description: 'Payment for cabai',
    customerName: 'Buyer Name',
    paymentMethod: 'QRIS',
  }),
});
```

**Access Flow**:
```
Client 
  → apps/web/api/v1/payments/* (BFF Proxy)
    → HTTP POST → apps/api/settlement/invoice
      → SettlementService.createPaymentInvoice()
        → SolosmartpayClient.createInvoice()
          → External API → https://api.solosmartpay.com
```

**Environment Variables**:
```bash
# .env
NEXT_PUBLIC_API_URL=http://localhost:4000  # apps/api URL
SOLOSMARTPAY_TOKEN=ssp_live_xxxxx
SOLOSMARTPAY_WEBHOOK_SECRET=xxx
```

---

## 2. Akses Pattern: Service Wrappers (Lightweight)

### Pooling Service

**Location**: 
- Implementation: `services/pooling-service/src/service.ts`
- Wrapper: `apps/api/src/pooling/pooling.service.ts`

**Access Pattern**:
```typescript
// apps/api/src/pooling/pooling.service.ts
import { PoolingService as CorePoolingService } from '@pasok/pooling-service';

@Injectable()
export class PoolingService {
  private readonly core = new CorePoolingService();

  async createReservation(context: SecurityContext, input: unknown) {
    // Direct import, no HTTP overhead
    return this.core.createReservation(context, input);
  }
}
```

**Why Kept Separate**:
- Complex RLS (Row-Level Security) adapter pattern
- Multi-tenant isolation critical
- PostgreSQL `withQuotaLock` distributed locking
- Fallback campaign logic

**Access Flow**:
```
Client 
  → apps/web 
    → HTTP → apps/api/pooling (wrapper)
      → Direct Import → @pasok/pooling-service (core logic)
        → PostgresEcosystemAdapter
          → withQuotaLock (Redis distributed lock)
            → Database query
```

### Logistics Hub Service

**Location**:
- Implementation: `services/logistics-hub-service/src/service.ts`
- Wrapper: `apps/api/src/logistics/logistics.service.ts`

**Access Pattern**:
```typescript
// apps/api/src/logistics/logistics.service.ts
import { LogisticsHubService as CoreLogisticsService } from '@pasok/logistics-hub-service';

@Injectable()
export class LogisticsService {
  private readonly core = new CoreLogisticsService();

  async recordWeighing(context: SecurityContext, data: WeighingData) {
    return this.core.recordDigitalWeighing(context, data);
  }
}
```

**Why Kept Separate**:
- SNI cold chain compliance logic
- QC dispute investigation workflows
- Digital weighing station integration

---

## 3. Akses Pattern: External HTTP Services

### ML Forecasting Service (Python FastAPI)

**Location**: `D:/MLPasokanMataram/` (Separate Python repository)

**Access Pattern**:
```typescript
// apps/api/src/forecast/forecast.service.ts
import axios from 'axios';

@Injectable()
export class ForecastService {
  private readonly httpClient = axios.create({
    baseURL: process.env.ML_FORECAST_URL || 'http://localhost:8000',
    timeout: 5000,
  });

  async getPriceForecast(commodity: string, regency: string) {
    const response = await this.httpClient.get('/api/v1/forecast', {
      params: { commodity, regency },
    });
    return response.data;
  }
}
```

**Access Flow**:
```
Client 
  → apps/web 
    → HTTP → apps/api/forecast
      → HTTP → ml-forecasting-service (Python FastAPI :8000)
        → LightGBM model inference
          → Return JSON prediction
```

**Why External**:
- Different tech stack (Python + FastAPI)
- ML dependencies (LightGBM, scikit-learn, pandas)
- Independent deployment cycle
- Model versioning separate from business logic

**Environment Variables**:
```bash
ML_FORECAST_URL=http://localhost:8000
ML_FORECAST_TIMEOUT_MS=5000
```

**Running ML Service**:
```bash
cd D:/MLPasokanMataram
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 4. Webhook Akses Pattern (External → Web)

### Solosmartpay Webhook

**Location**: `apps/web/src/app/api/v1/webhooks/solosmartpay/route.ts`

**Why in Web, Not API**:
- External service (Solosmartpay) hits web endpoint directly
- Edge verification untuk security (HMAC-SHA256 at entry point)
- Direct database update (no extra HTTP hop)

**Access Flow**:
```
Solosmartpay Server (External)
  → HTTPS POST → https://pasok.syapratama.tech/api/v1/webhooks/solosmartpay
    → Next.js Route Handler
      → verifyWebhookSignature() (crypto.subtle)
        → Check duplicate (webhook_events table)
          → Update pooling_reservations status
            → Return 200 OK
```

**Webhook Registration**:
```
URL: https://pasok.syapratama.tech/api/v1/webhooks/solosmartpay
Events: payment.paid, payment.failed, payment.expired
Signature: HMAC-SHA256 (X-SoloSmartPay-Signature header)
```

---

## 5. Configuration & Environment

### Development Setup

```bash
# .env.development
NODE_ENV=development
PORT=3000

# Apps/API URL (for BFF proxy)
NEXT_PUBLIC_API_URL=http://localhost:4000
API_BASE_URL=http://localhost:4000

# ML Service URL
ML_FORECAST_URL=http://localhost:8000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=xxx
DB_NAME=pasokmataram_db

# Upstash Redis (untuk distributed locks)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

# Solosmartpay
SOLOSMARTPAY_TOKEN=ssp_test_xxxxx
SOLOSMARTPAY_WEBHOOK_SECRET=test_secret
SOLOSMARTPAY_SANDBOX=true

# Appwrite (KYB storage)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=xxx
APPWRITE_API_KEY=xxx
APPWRITE_BUCKET_ID=kyb-documents-dev
```

### Production Setup

```bash
# .env.production
NODE_ENV=production

# Apps/API URL (internal network)
NEXT_PUBLIC_API_URL=https://api.syapratama.tech
API_BASE_URL=http://localhost:4000  # Internal

# ML Service URL (internal)
ML_FORECAST_URL=http://ml-forecast:8000

# Solosmartpay (production)
SOLOSMARTPAY_TOKEN=ssp_live_xxxxx
SOLOSMARTPAY_WEBHOOK_SECRET=live_secret
SOLOSMARTPAY_SANDBOX=false
```

---

## 6. Service Communication Matrix

| From         | To                  | Method        | Latency  | Notes                          |
|--------------|---------------------|---------------|----------|--------------------------------|
| Client       | apps/web            | HTTPS         | ~20ms    | CDN edge                       |
| apps/web     | apps/api            | HTTP (proxy)  | ~50ms    | Internal network               |
| apps/api     | pooling-service     | Direct import | ~1ms     | In-process call                |
| apps/api     | logistics-service   | Direct import | ~1ms     | In-process call                |
| apps/api     | ml-forecasting      | HTTP          | ~200ms   | External Python service        |
| Solosmartpay | apps/web (webhook)  | HTTPS         | ~100ms   | External → Web direct          |
| apps/api     | Solosmartpay API    | HTTPS         | ~300ms   | Payment gateway external       |

---

## 7. Testing Service Access

### Test Auth Service

```bash
curl -X POST http://localhost:4000/api/auth/kyb-upload \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "test-tenant",
    "documentType": "NIB",
    "fileName": "nib.pdf",
    "contentType": "application/pdf"
  }'
```

### Test Settlement via BFF Proxy

```bash
curl -X POST http://localhost:3000/api/v1/payments/solosmartpay \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=xxx" \
  -d '{
    "orderId": "ORDER-001",
    "amountRp": 500000,
    "customerName": "Test Buyer",
    "customerEmail": "test@example.com",
    "method": "QRIS"
  }'
```

### Test ML Forecast

```bash
curl -X GET "http://localhost:8000/api/v1/forecast?commodity=cabai&regency=sleman"
```

### Simulate Webhook

```bash
# Generate HMAC signature first
curl -X POST http://localhost:3000/api/v1/webhooks/solosmartpay \
  -H "Content-Type: application/json" \
  -H "X-SoloSmartPay-Signature: sha256=xxx" \
  -H "X-SoloSmartPay-Timestamp: 1699012800" \
  -d '{
    "id": "evt_test123",
    "type": "payment.paid",
    "data": {
      "reference": "ORDER-001",
      "amount": 500000,
      "status": "paid",
      "paid_at": "2024-11-03T10:00:00Z"
    },
    "timestamp": "2024-11-03T10:00:00Z"
  }'
```

---

## 8. Migration Benefits

### Before (Microservices Overhead)
```
Client → Web → HTTP → auth-kyb-service (separate process :5001)
Client → Web → HTTP → settlement-service (separate process :5002)
```
**Issues**: 
- 2 extra HTTP hops
- Process management complexity
- Duplicate client instantiation

### After (Selective Consolidation)
```
Client → Web → HTTP → apps/api (single process :4000)
  → auth/ (inline)
  → settlement/ (inline)
  → pooling/ → @pasok/pooling-service (direct import)
  → forecast/ → HTTP → ml-forecasting-service (external)
```
**Benefits**:
- 50% fewer HTTP hops for auth/settlement
- Single process deployment for core logic
- Complex services (pooling/logistics) kept modular
- External services (ML) stay independent

---

## Summary

**Consolidated** (Inline in apps/api):
- ✅ Auth & KYB (Appwrite, JWT, Argon2)
- ✅ Settlement (Solosmartpay client)

**Kept as Services** (Direct import wrappers):
- ✅ Pooling (RLS adapter, distributed locks)
- ✅ Logistics (SNI compliance, QC workflows)

**External HTTP**:
- ✅ ML Forecasting (Python FastAPI)

**Edge Handlers** (apps/web):
- ✅ Solosmartpay Webhooks (external → web direct)
