# CI/CD Pipeline - PasokMataram Monolith

## Overview

Automated build, test, dan deployment pipeline untuk monolith architecture menggunakan GitHub Actions.

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions Pipeline                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Push to main / PR                                           │
│         │                                                    │
│         ├── CI Workflow (.github/workflows/ci.yml)          │
│         │   ├── Lint (TypeScript + ESLint)                  │
│         │   ├── Type Check (tsc --noEmit)                   │
│         │   ├── Unit Tests (Vitest)                         │
│         │   └── Build Verification                          │
│         │                                                    │
│         └── Deploy Workflow (.github/workflows/deploy.yml)  │
│             ├── Build Web (Next.js Standalone)              │
│             ├── Build API (NestJS Bundled)                  │
│             ├── Deploy Web → public_html/                   │
│             └── Deploy API → api/                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Workflows

### 1. CI Workflow (ci.yml)

**Trigger**: Push to any branch, Pull Requests

```yaml
name: CI

on:
  push:
    branches: ['**']
  pull_request:

jobs:
  lint:
    - TypeScript strict check
    - ESLint validation
    - Zero // comments check
    
  test:
    - Vitest unit tests
    - Integration tests
    
  build:
    - Turborepo build --filter=@pasok/web
    - Turborepo build --filter=@pasok/api
```

**Commands**:
```bash
# Run locally sebelum push
npm run lint
npm run test
npm run build
```

### 2. Deploy Workflow (deploy.yml)

**Trigger**: Push to main, Manual dispatch

**Jobs Flow**:

```
build-web ──────┬──→ deploy-web
                │
build-api ──────┴──→ deploy-api ──→ notify-summary
```

#### Job 1: build-web

**Purpose**: Build Next.js standalone artifacts

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies (`npm ci`)
4. Create .env files from GitHub Secrets
5. Build Next.js standalone: `npm run build -- --filter=@pasok/web`
6. Package artifacts:
   ```bash
   web-dist/
   ├── apps/web/.next/standalone/
   ├── apps/web/.next/static/
   ├── apps/web/public/
   ├── server.js              # Entry point
   ├── .env.production
   └── .htaccess
   ```
7. Create tarball: `web-build.tar.gz`
8. Upload artifact (retention: 7 days)

**Output**: `web-build.tar.gz` (~50MB)

#### Job 2: build-api

**Purpose**: Bundle NestJS monolith

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Bundle with esbuild:
   ```bash
   npx esbuild apps/api/src/main.ts \
     --bundle \
     --platform=node \
     --target=node20 \
     --format=esm \
     --packages=external \
     --outfile=apps/api/dist/main.js
   ```
5. Package artifacts:
   ```bash
   api-dist/
   ├── dist/main.js           # Bundled NestJS
   ├── server.js              # Entry point
   ├── package.json
   ├── node_modules/          # Production deps only
   └── .env.production
   ```
6. Create tarball: `api-build.tar.gz`
7. Upload artifact (retention: 7 days)

**Output**: `api-build.tar.gz` (~30MB with node_modules)

#### Job 3: deploy-web

**Purpose**: Deploy Web frontend ke shared hosting

**Steps**:
1. Download `web-build.tar.gz` artifact
2. Install sshpass
3. Upload via SCP:
   ```bash
   sshpass -p "$SSH_PASSWORD" scp -P $SSH_PORT \
     web-build.tar.gz $SSH_USER@$SSH_HOST:~/
   ```
4. Extract di server:
   ```bash
   ssh $SSH_USER@$SSH_HOST << 'REMOTE'
     cd $WEB_DEPLOY_PATH
     tar -xzf ~/web-build.tar.gz
     rm ~/web-build.tar.gz
     mkdir -p tmp && touch tmp/restart.txt
   REMOTE
   ```
5. Restart Passenger/PM2
6. Verify deployment

**Environment Variables**:
- `SSH_HOST`: Server hostname (dari GitHub Secrets)
- `SSH_USER`: SSH username
- `SSH_PASSWORD`: SSH password
- `SSH_PORT`: SSH port (default: 22)
- `WEB_DEPLOY_PATH`: `/home/syaprata/public_html`

#### Job 4: deploy-api

**Purpose**: Deploy API backend ke shared hosting

**Steps**:
1. Download `api-build.tar.gz` artifact
2. Upload via SCP
3. Extract di server:
   ```bash
   ssh $SSH_USER@$SSH_HOST << 'REMOTE'
     cd $API_DEPLOY_PATH
     tar -xzf ~/api-build.tar.gz
     npm ci --production
     rm ~/api-build.tar.gz
     pm2 restart pasokmataram-api || pm2 start server.js --name pasokmataram-api
   REMOTE
   ```
4. Restart API process
5. Health check

**Environment Variables**:
- `API_DEPLOY_PATH`: `/home/syaprata/api`

---

## GitHub Secrets Configuration

### Required Secrets

**SSH Access**:
```
SSH_HOST=syapratama.tech
SSH_USER=syaprata
SSH_PASSWORD=your_ssh_password
SSH_PORT=21098
```

**Deploy Paths**:
```
WEB_DEPLOY_PATH=/home/syaprata/public_html
API_DEPLOY_PATH=/home/syaprata/api
```

**Environment Files** (multiline mentah, bukan base64):
```bash
gh secret set ENV_PRODUCTION < apps/web/.env.production
gh secret set ENV_DEVELOPMENT < apps/web/.env.development
```

`ENV_PRODUCTION` dan `ENV_DEVELOPMENT` WAJIB memuat kredensial Upstash Redis. Pipeline menolak build bila tidak ada:

```text
UPSTASH_REDIS_REST_URL=https://<database>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<rest token>
```

### Setting up Secrets

1. GitHub Repository → Settings
2. Secrets and variables → Actions
3. New repository secret
4. Paste key dan value
5. Save

---

## Local Development Setup

### Prerequisites

```bash
# Node.js 20.x
node -v  # v20.x.x

# Install dependencies
npm ci

# Setup env
cp .env.example .env.development
# Edit .env.development dengan credentials lokal
```

### Development Commands

```bash
# Start development servers
npm run dev          # Turborepo dev semua apps

# Specific app
npm run dev --filter=@pasok/web
npm run dev --filter=@pasok/api

# Lint
npm run lint         # All apps
npm run lint:fix     # Auto-fix

# Test
npm run test         # Vitest unit tests
npm run test:watch   # Watch mode

# Build
npm run build        # Production build
npm run build --filter=@pasok/web
npm run build --filter=@pasok/api

# Type check
cd apps/web && npx tsc --noEmit
cd apps/api && npx tsc --noEmit
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] Lint clean (`npm run lint`)
- [ ] TypeScript strict check passing
- [ ] Build successful (`npm run build`)
- [ ] Zero `//` comments di kode produksi
- [ ] Environment secrets updated di GitHub
- [ ] Database migrations prepared

### Deployment Steps

**Automatic (Recommended)**:
```bash
# 1. Merge PR ke main
git checkout main
git pull origin main

# 2. Workflow auto-triggers on push
git push origin main

# 3. Monitor deployment
gh run list
gh run view <run-id> --log

# 4. Verify
curl https://syapratama.tech/api/health
curl https://api.syapratama.tech/health
```

**Manual (Emergency)**:
```bash
# 1. Trigger manual dispatch
gh workflow run deploy.yml

# 2. Monitor
gh run watch

# 3. SSH verify
ssh syaprata@syapratama.tech -p 21098
pm2 status
pm2 logs pasokmataram-web --lines 50
pm2 logs pasokmataram-api --lines 50
```

### Post-Deployment

- [ ] Verify Web: https://syapratama.tech
- [ ] Verify API: https://api.syapratama.tech/health
- [ ] Check logs: `pm2 logs`
- [ ] Database migrations applied
- [ ] Smoke test critical flows:
  - [ ] Login
  - [ ] KYB document upload
  - [ ] Payment invoice creation
  - [ ] Pooling reservation
  - [ ] Webhook receipt

---

## Rollback Procedure

### Quick Rollback (Backups)

```bash
ssh syaprata@syapratama.tech -p 21098

# List backups
ls -lh ~/*_backup_*

# Restore Web
cd ~
mv public_html public_html_failed
mv public_html_backup_20261103_120000 public_html
cd public_html
mkdir -p tmp && touch tmp/restart.txt

# Restore API
cd ~
mv api api_failed
mv api_backup_20261103_120000 api
pm2 restart pasokmataram-api
```

### Git Rollback

```bash
# Revert last commit
git revert HEAD
git push origin main

# Workflow auto-deploys previous version
```

---

## Monitoring & Alerts

### Health Endpoints

```bash
# Web health
curl https://syapratama.tech/api/health

# API health
curl https://api.syapratama.tech/health

# Expected response
{
  "status": "ok",
  "timestamp": "2026-11-03T11:56:33.153Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### PM2 Monitoring

```bash
ssh syaprata@syapratama.tech -p 21098

# Status
pm2 status

# Logs
pm2 logs pasokmataram-web --lines 100
pm2 logs pasokmataram-api --lines 100

# Real-time monitoring
pm2 monit

# Memory/CPU usage
pm2 describe pasokmataram-api
```

### Log Locations

```
~/logs/
├── pasokmataram-web.log        # Passenger logs
├── pasokmataram-api.log        # Passenger logs
├── pm2/
│   ├── pasokmataram-web-out.log
│   ├── pasokmataram-web-error.log
│   ├── pasokmataram-api-out.log
│   └── pasokmataram-api-error.log
```

---

## Performance Optimization

### Build Optimization

**Next.js Standalone**:
- Output: ~50MB (vs ~200MB with node_modules)
- Startup: 2-3 seconds
- Memory: ~150MB idle

**NestJS esbuild Bundle**:
- Output: ~2MB bundled JS
- Startup: 1-2 seconds
- Memory: ~100MB idle

### Deployment Speed

**GitHub Actions**:
- Build: 3-5 minutes
- Deploy: 1-2 minutes
- Total: 5-7 minutes end-to-end

**SSH Direct**:
- Build locally: 2-3 minutes
- Upload: 30-60 seconds (50MB)
- Extract: 10-20 seconds
- Total: 3-5 minutes

### Caching Strategy

**GitHub Actions Cache**:
```yaml
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
      apps/*/node_modules
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
```

**Result**: 30-40% faster builds on cache hit

---

## Troubleshooting

### Build Failures

**Issue**: TypeScript errors
```bash
# Local check
npx tsc --noEmit

# Fix
# Review error output, fix types
```

**Issue**: Lint failures
```bash
# Auto-fix
npm run lint:fix

# Manual review
npm run lint
```

**Issue**: Test failures
```bash
# Run locally
npm test

# Specific test
npm test -- <test-file>
```

### Deployment Failures

**Issue**: SSH timeout
```yaml
# deploy.yml already has retry logic
for i in 1 2 3; do
  if sshpass -p "$SSH_PASSWORD" scp ...; then
    exit 0
  fi
  sleep 5
done
```

**Issue**: Permission denied
```bash
ssh syaprata@syapratama.tech -p 21098
chmod 755 ~/public_html ~/api
chmod 644 ~/public_html/.env.production
chmod 644 ~/api/.env.production
```

**Issue**: Port already in use
```bash
pm2 delete pasokmataram-api
lsof -ti:4000 | xargs kill -9
pm2 start ~/api/server.js --name pasokmataram-api
```

### Runtime Issues

**Issue**: App crash loop
```bash
pm2 logs pasokmataram-api --lines 100

# Common causes:
# - Missing env vars
# - Database connection failed
# - Port binding failed

# Fix
pm2 stop pasokmataram-api
# Review logs, fix issue
pm2 start pasokmataram-api
```

**Issue**: Memory leak
```bash
pm2 describe pasokmataram-api

# Restart if memory > 1GB
pm2 restart pasokmataram-api
```

**Issue**: Database connection pool exhausted
```bash
# Check connections
mysql -u root -p -e "SHOW PROCESSLIST"

# Kill long queries
mysql -u root -p -e "KILL <id>"

# Restart app
pm2 restart pasokmataram-api
```

---

## Security Best Practices

### Secrets Management

- ✅ Never commit .env files
- ✅ Use GitHub Secrets for credentials
- ✅ Rotate passwords quarterly
- ✅ Use SSH keys instead of passwords (when possible)
- ✅ Limit SSH access by IP (if VPS)

### Deployment Security

- ✅ Always deploy from protected main branch
- ✅ Require PR reviews before merge
- ✅ Run security audit: `npm audit`
- ✅ Keep dependencies updated
- ✅ Use HTTPS only (enforce via .htaccess)

### Runtime Security

- ✅ Protect .env files via .htaccess
- ✅ Use JWT with short expiry
- ✅ Rate limit API endpoints
- ✅ Validate all inputs
- ✅ Sanitize database queries (use ? placeholders)
- ✅ Enable CORS properly
- ✅ Monitor failed login attempts

---

## Summary

**CI/CD Flow**:
```
Developer → Git Push → GitHub Actions → Build → Test → Deploy → Health Check
```

**Key Files**:
- `.github/workflows/ci.yml` - Continuous Integration
- `.github/workflows/deploy.yml` - Automated Deployment
- `apps/web/.env.production` - Web environment
- `apps/api/.env.production` - API environment

**Deployment Targets**:
- Web: `/home/syaprata/public_html` → https://syapratama.tech
- API: `/home/syaprata/api` → https://api.syapratama.tech

**Monitoring**:
- PM2: `pm2 status`, `pm2 logs`
- Health: `/api/health` endpoints
- GitHub Actions: Workflow run logs
