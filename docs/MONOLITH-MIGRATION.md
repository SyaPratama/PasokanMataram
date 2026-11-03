# Monolith Migration Strategy

## Overview

Konsolidasi microservices architecture ke NestJS monolith untuk simplifikasi deployment, development, dan maintenance.

## Current Architecture (Microservices)

```
services/
├── auth-kyb-service/          → apps/api/src/auth/
├── settlement-service/        → apps/api/src/settlement/
├── pooling-service/          → apps/api/src/pooling/
├── logistics-hub-service/    → apps/api/src/logistics/
├── queue-worker/             → apps/api/src/workers/
└── ml-forecasting-service/   → KEEP SEPARATE (FastAPI Python)
```

## Target Architecture (Monolith)

```
apps/api/src/
├── auth/                    # Identity, JWT, KYB uploads, Appwrite integration
├── settlement/              # Solosmartpay client, webhook handling
├── pooling/                 # Reservation logic, MTV validation, Redis locks
├── logistics/               # Hub operations, weighing, QC disputes
├── workers/                 # Background job handlers (ex-queue-worker)
├── forecast/                # HTTP client to ML service (external)
└── common/                  # Shared guards, interceptors, filters
```

## Migration Phases

### Phase 3.1: Planning (Current)
- [X] Audit service dependencies
- [X] Map logic to NestJS modules
- [X] Identify shared utilities
- [X] Create migration strategy

### Phase 3.2: Auth & KYB Migration
**Source**: `services/auth-kyb-service/`  
**Destination**: `apps/api/src/auth/`

**Functions to move**:
- `generateKybUploadUrl()` - Appwrite presigned upload
- `applyKybWatermark()` - Dynamic watermarking
- `createSessionToken()` - JWT signing
- `hashPassword()` - Argon2id hashing
- `bootstrapAuthService()` - Startup health check

**Current usage**:
- `apps/api/src/auth/auth.service.ts` imports `generateKybUploadUrl, applyKybWatermark`

**Action**:
1. Copy functions directly into `apps/api/src/auth/auth.service.ts`
2. Update imports (remove `@pasok/auth-kyb-service`)
3. Keep lazy Appwrite client pattern
4. Delete `services/auth-kyb-service/`

### Phase 3.3: Settlement Migration
**Source**: `services/settlement-service/`  
**Destination**: `apps/api/src/settlement/`

**Classes to move**:
- `SolosmartpayClient` - HTTP client for payment gateway
- `SettlementService` - Invoice creation, status checks
- `parseWebhook()` - HMAC-SHA256 signature verification

**Current usage**:
- `apps/api/src/settlement/settlement.service.ts` - wrapper delegating to core
- `apps/web/src/app/api/v1/payments/solosmartpay/route.ts` - direct import
- `apps/web/src/app/api/v1/sandbox/payment-simulate/route.ts` - SolosmartpayClient

**Action**:
1. Move `solosmartpay.ts` and `service.ts` to `apps/api/src/settlement/`
2. Inline logic into `settlement.service.ts` (remove wrapper pattern)
3. Update web BFF routes to use NestJS HTTP client to API
4. Delete `services/settlement-service/`

### Phase 3.4: Pooling & Logistics Migration
**Source**: `services/pooling-service/`, `services/logistics-hub-service/`  
**Destination**: `apps/api/src/pooling/`, `apps/api/src/logistics/`

**Pooling functions**:
- Reservation creation with MTV Rp 500k validation
- Redis Redlock distributed locking
- Quota availability checks

**Logistics functions**:
- Hub weighing station operations
- SNI cold chain compliance
- QC dispute investigation

**Current usage**:
- `apps/api/src/pooling/pooling.service.ts` - wrapper to `CorePoolingService`
- `apps/api/src/logistics/logistics.service.ts` - wrapper pattern

**Action**:
1. Inline pooling logic into `apps/api/src/pooling/pooling.service.ts`
2. Inline logistics logic into `apps/api/src/logistics/logistics.service.ts`
3. Move Redis lock to `packages/database/src/locks/`
4. Delete `services/pooling-service/` and `services/logistics-hub-service/`

### Phase 3.5: Queue Worker Migration
**Source**: `services/queue-worker/`  
**Destination**: `apps/api/src/workers/`

**Handlers to move**:
- `ml-forecast-publisher.ts` - Publish price forecasts
- `ml-ingest-handler.ts` - Ingest market data
- (escrow-disbursement.ts already removed)

**Action**:
1. Create `apps/api/src/workers/` module
2. Use NestJS `@nestjs/schedule` for cron jobs
3. Convert queue handlers to NestJS providers
4. Update `packages/queue/` contracts if needed
5. Delete `services/queue-worker/`

### Phase 3.6: ML Forecasting (Keep Separate)
**Source**: `services/ml-forecasting-service/` (FastAPI Python)  
**Status**: KEEP AS EXTERNAL SERVICE

**Rationale**:
- Python-specific ML libraries (LightGBM, scikit-learn)
- Separate deployment lifecycle
- HTTP API contract already defined

**Action**:
1. Verify `apps/api/src/forecast/forecast.service.ts` uses HTTP client
2. Document API contract in `docs/ML-API-CONTRACT.md`
3. No migration needed

### Phase 3.7: Cleanup & Verification
**Actions**:
1. Remove empty `services/` directories (except ml-forecasting-service)
2. Update `package.json` scripts
3. Update `docker-compose.yml` for single API container
4. Run lint, tests, audit
5. Update `DEPLOYMENT.md`

## Dependency Mapping

### Before (Microservices)
```json
{
  "@pasok/auth-kyb-service": "workspace:*",
  "@pasok/settlement-service": "workspace:*",
  "@pasok/pooling-service": "workspace:*",
  "@pasok/logistics-hub-service": "workspace:*",
  "@pasok/queue-worker": "workspace:*"
}
```

### After (Monolith)
```json
{
  "@pasok/config": "workspace:*",
  "@pasok/database": "workspace:*",
  "@pasok/domain": "workspace:*",
  "@pasok/queue": "workspace:*"
}
```

## Shared Utilities

Keep in `packages/`:
- `packages/config/` - Zod schemas, env validation
- `packages/database/` - MySQL pool, RLS, migrations
- `packages/domain/` - Branded types, entities
- `packages/queue/` - Message broker contracts
- `packages/security/` - (if needed for crypto utilities)

## Testing Strategy

**Unit tests**: Update imports, keep test logic  
**Integration tests**: Update service endpoints  
**Contract tests**: Remove inter-service communication tests

## Rollback Plan

Git branch: `feat/monolith-consolidation`  
If issues: revert commits, redeploy from `feat/escrow-to-solosmartpay-sdk`

## Success Criteria

- [ ] All services consolidated into `apps/api/src/`
- [ ] Zero `@pasok/*-service` imports in apps/
- [ ] Lint passes: `npm run lint`
- [ ] Tests pass: `npx vitest run`
- [ ] Single Docker container deploys successfully
- [ ] All API endpoints functional

## Timeline

**Estimated**: 2-3 hours  
**Phases**: Sequential execution (3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7)

## References

- Original microservices: `services/*/src/`
- NestJS modules: `apps/api/src/*/`
- Package utilities: `packages/*/src/`
