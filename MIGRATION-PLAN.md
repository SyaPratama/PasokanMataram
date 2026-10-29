# PasokMataram Shared Hosting Migration Plan

**Run ID:** `run_5c5db17c52c7`  
**Created:** 2026-10-29T10:20:45Z  
**Objective:** Migrate from PostgreSQL/MinIO/Redis to MySQL/Cloudinary/cPanel Redis

---

## 🎯 Executive Summary

**Problem:** Current stack (PostgreSQL, MinIO S3, Redis standalone) tidak compatible dengan shared hosting cPanel.

**Solution:** Migrate ke MySQL, Cloudinary (free tier), dan Redis cPanel.

**Estimated Time:** 10-12 hours total (4 parallel workers)

---

## 📋 Migration Phases

### Phase 1: Database Migration (PostgreSQL → MySQL)
**Estimated:** 4-5 hours  
**Worker:** `migration-database`

**Tasks:**
1. Change `pg` package → `mysql2`
2. Update connection pool (packages/database/src/client.ts)
3. Convert PostgreSQL-specific syntax:
   - `RETURNING *` → separate SELECT query
   - `ON CONFLICT` → `ON DUPLICATE KEY UPDATE`
   - `::jsonb` → `JSON` type
   - Array types → JSON arrays
   - `SERIAL` → `AUTO_INCREMENT`
4. Update 18 schema files in packages/database/src/schema/
5. Rewrite migrations in packages/database/src/migrator.ts
6. Update RLS (Row Level Security) → MySQL equivalent or application-level
7. Test all database operations

**Files Modified:**
- `packages/database/package.json`
- `packages/database/src/client.ts`
- `packages/database/src/schema/*.ts` (18 files)
- `packages/database/src/migrator.ts`
- All services using database queries

### Phase 2: Object Storage Migration (MinIO → Cloudinary)
**Estimated:** 2-3 hours  
**Worker:** `migration-storage`

**Tasks:**
1. Sign up Cloudinary free tier (10GB storage, 25 credits/month)
2. Install `cloudinary` package
3. Replace MinIO SDK calls with Cloudinary Upload API
4. Update watermark logic (Cloudinary transformation API)
5. Update presigned URL generation
6. Migrate KYB document upload logic
7. Update environment variables

**Files Modified:**
- `services/auth-kyb-service/package.json`
- `services/auth-kyb-service/src/*` (MinIO calls)
- `.env.development.example`
- `.env.production.example`

**New Environment Variables:**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Phase 3: Redis Configuration (Standalone → cPanel Redis)
**Estimated:** 1-2 hours  
**Worker:** `migration-redis`

**Tasks:**
1. Update Redis connection string format for cPanel
2. Test rate limiting with cPanel Redis
3. Test Redlock distributed locking
4. Update environment variables
5. Add connection retry logic

**Files Modified:**
- `packages/config/src/index.ts`
- `.env.development.example`
- `.env.production.example`

**New Environment Variables:**
```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_cpanel_redis_password
REDIS_DB=0
```

### Phase 4: Next.js Public Runtime Config (Monorepo URLs)
**Estimated:** 1 hour  
**Worker:** `migration-nextjs-config`

**Tasks:**
1. Add `publicRuntimeConfig` to next.config.mjs
2. Update API base URLs for separate web/api domains
3. Add environment variable mapping
4. Update client-side API calls

**Files Modified:**
- `apps/web/next.config.mjs`
- `apps/web/src/lib/api-client.ts` (if exists)
- `.env.development.example`
- `.env.production.example`

**New Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api.syapratama.tech
NEXT_PUBLIC_WEB_URL=https://pasok.syapratama.tech
```

---

## 🔄 Execution Strategy

**Parallel Execution:**
- Phase 1 (Database) - Worker A (largest scope)
- Phase 2 (Storage) - Worker B (independent)
- Phase 3 (Redis) - Worker C (independent)
- Phase 4 (Next.js) - Worker D (independent)

**Dependencies:**
- None - all phases are independent
- Integration testing after all complete

---

## ✅ Acceptance Criteria

**Phase 1 (Database):**
- [ ] All TypeScript compile without errors
- [ ] All 18 schema files converted to MySQL syntax
- [ ] Database migrations run successfully
- [ ] All database tests pass

**Phase 2 (Storage):**
- [ ] Cloudinary SDK integrated
- [ ] File upload works
- [ ] Watermark transformation works
- [ ] Presigned URLs generated correctly

**Phase 3 (Redis):**
- [ ] cPanel Redis connection successful
- [ ] Rate limiting works
- [ ] Redlock distributed locking works

**Phase 4 (Next.js):**
- [ ] Public runtime config loads correctly
- [ ] API calls use correct URLs
- [ ] Environment variables mapped properly

---

## 🚨 Risk Mitigation

**Database Migration Risks:**
- PostgreSQL-specific features may not have MySQL equivalents
- RLS implementation complex in MySQL
- **Mitigation:** Document PostgreSQL features used, implement application-level RLS

**Storage Migration Risks:**
- Cloudinary free tier limits (10GB, 25 credits/month)
- **Mitigation:** Monitor usage, implement local fallback for development

**Redis Migration Risks:**
- cPanel Redis may have limited features
- **Mitigation:** Test all Redis features before deployment

---

## 📦 Deliverables

1. **Migration Guide Document** (this file)
2. **Updated Database Package** (MySQL compatible)
3. **Updated Auth-KYB Service** (Cloudinary integration)
4. **Updated Configuration Package** (cPanel Redis)
5. **Updated Next.js Config** (public runtime config)
6. **Updated Environment Templates** (all new variables)
7. **Migration Test Results** (proof of functionality)

---

## 🎯 Next Steps

1. Dispatch 4 parallel workers
2. Monitor progress via orchestration
3. Collect worker_done reports
4. Integration testing
5. Update deployment workflow
6. Update documentation
7. Deploy to shared hosting

---

**Created by:** Orchestrated migration planning  
**Session Duration:** 18+ hours (current)  
**Target Completion:** +10-12 hours (parallel execution)
