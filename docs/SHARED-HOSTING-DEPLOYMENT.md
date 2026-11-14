# Shared Hosting Deployment Guide - Monolith Architecture

## Overview

Panduan deployment PasokMataram ke shared hosting (cPanel/DirectAdmin) dengan arsitektur monolith yang sudah dikonsolidasi.

---

## Architecture Deployment

```
Shared Hosting Server
├── public_html/                    # Web Frontend (Next.js Standalone)
│   ├── apps/web/                   # Next.js artifacts
│   │   ├── .next/standalone/
│   │   ├── .next/static/
│   │   └── public/
│   ├── server.js                   # Entry point
│   ├── .env.production
│   └── .htaccess                   # Passenger/LiteSpeed config
│
├── api/                            # API Backend (NestJS Monolith)
│   ├── dist/main.js               # Bundled NestJS
│   ├── node_modules/              # Production deps
│   ├── server.js                  # Entry point
│   └── .env.production
│
└── services/                       # Service Dependencies (Optional)
    ├── pooling-service/           # Direct import (no separate process)
    ├── logistics-hub-service/     # Direct import (no separate process)
    └── ml-forecasting/            # Python FastAPI (separate if possible)
        └── (Deploy to separate Python hosting or VPS)
```

---

## Prerequisites

### Server Requirements

**Minimum**:
- Node.js 20.x LTS
- MySQL 8.0+
- Redis 7.x
- RAM: 2GB minimum (4GB recommended)
- Storage: 5GB untuk apps + node_modules

**Shared Hosting Features Needed**:
- Node.js App Manager (Passenger/LiteSpeed)
- SSH Access
- Cron Jobs
- Multiple Node.js apps support

**Recommended Providers**:
- Hostinger (Business/Cloud hosting)
- Niagahoster (Bisnis/Ultimate)
- DomaiNesia (Cloud hosting)
- Herza Cloud (Cloud VPS)

---

## Deployment Methods

### Method 1: GitHub Actions CI/CD (Recommended)

#### Step 1: Setup GitHub Secrets

Di repository Settings → Secrets and variables → Actions, tambahkan:

```yaml
# SSH Credentials
SSH_HOST: syapratama.tech
SSH_USER: syaprata
SSH_PRIVATE_KEY: <OpenSSH private key content>
SSH_KNOWN_HOSTS: <pinned ssh-keyscan output>
SSH_PORT: 22

# Deploy Paths
WEB_DEPLOY_PATH: /home/syaprata/public_html
API_DEPLOY_PATH: /home/syaprata/api

# Database Runtime
DB_HOST: localhost
DB_PORT: 3306
DB_USER: <cPanel database user>
DB_PASSWORD: <database password>
DB_NAME: <cPanel database name>

# Environment Files (raw multiline content)
ENV_PRODUCTION: <contents of .env.production>
ENV_DEVELOPMENT: <contents of .env.development>
```

**Set ENV secrets**:
```bash
gh secret set ENV_PRODUCTION < .env.production
gh secret set ENV_DEVELOPMENT < .env.development
```

`.env.production` dan `.env.development` WAJIB memuat `UPSTASH_REDIS_REST_URL=https://<database>.upstash.io` dan `UPSTASH_REDIS_REST_TOKEN=<rest token>`. Build web dan upload API gagal dengan `::error::` bila salah satu tidak ada; tidak ada fallback Redis lokal.

#### Step 2: Workflow Sudah Configured

File `.github/workflows/deploy.yml` sudah ada:

**Jobs**:
1. `build-web` - Build Next.js standalone
2. `build-api` - Bundle NestJS dan workspace internal dengan esbuild; paketkan hanya dependency native produksi
3. `deploy-web` - Upload & extract ke public_html
4. `deploy-api` - Upload & extract ke api/

**Trigger**:
```bash
# Automatic on push to main
git push origin main

# Manual dispatch
gh workflow run deploy.yml
```

#### Step 3: Monitor Deployment

```bash
# GitHub UI: Actions tab
# atau CLI
gh run list
gh run view <run-id> --log
```

---

### Method 2: Manual SSH Deployment

#### A. Web Frontend Deployment

```bash
# 1. Build locally
npm ci
npm run build -- --filter=@pasok/web

# 2. Package standalone
cd apps/web
tar -czf web-build.tar.gz \
  .next/standalone \
  .next/static \
  public \
  .env.production

# 3. Upload ke server
scp -P 21098 web-build.tar.gz syaprata@syapratama.tech:~/

# 4. Extract di server
ssh syaprata@syapratama.tech -p 21098
cd ~/public_html
tar -xzf ~/web-build.tar.gz
rm ~/web-build.tar.gz

# 5. Setup server.js entry point
cat > server.js << 'EOF'
import fs from 'fs';
import path from 'path';

// Load environment
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';

if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8');
  for (const line of content.split('\n')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
}

import('./apps/web/server.js');
EOF

# 6. Restart via Passenger
mkdir -p tmp && touch tmp/restart.txt
```

#### B. API Backend Deployment

```bash
# 1. Bundle API
npx esbuild apps/api/src/main.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=esm \
  --packages=external \
  --outfile=apps/api/dist/main.js

# 2. Package
cd apps/api
tar -czf api-build.tar.gz \
  dist/main.js \
  package.json \
  .env.production

# 3. Upload
scp -P 21098 api-build.tar.gz syaprata@syapratama.tech:~/

# 4. Extract
ssh syaprata@syapratama.tech -p 21098
mkdir -p ~/api
cd ~/api
tar -xzf ~/api-build.tar.gz
npm ci --production
rm ~/api-build.tar.gz

# 5. Setup server.js
cat > server.js << 'EOF'
import fs from 'fs';
const envFile = '.env.production';
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8');
  for (const line of content.split('\n')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
}
import('./dist/main.js');
EOF

# 6. Start dengan PM2
pm2 start server.js --name pasokmataram-api
pm2 save
```

---

## cPanel/DirectAdmin Configuration

### 1. Setup Node.js App (Passenger)

**cPanel → Setup Node.js App**:

**Web App**:
- Application root: `/home/syaprata/public_html`
- Application URL: `https://syapratama.tech`
- Application startup file: `server.js`
- Node.js version: 20.x
- Environment: production

**API App**:
- Application root: `/home/syaprata/api`
- Application URL: `https://api.syapratama.tech` (subdomain)
- Application startup file: `server.js`
- Node.js version: 20.x
- Environment: production

### 2. Configure .htaccess (Web)

```apache
# /home/syaprata/public_html/.htaccess

# Passenger Configuration
PassengerEnabled On
PassengerAppEnv production
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs /usr/bin/node

# Next.js Static Assets
RewriteEngine On
RewriteBase /

# Security
<FilesMatch "^\.env|^\.git">
    Order allow,deny
    Deny from all
</FilesMatch>

# Next.js Routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /server.js [L,QSA]

# Error Documents
ErrorDocument 404 /404
ErrorDocument 500 /

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>
```

### 3. Configure .htaccess (API)

```apache
# /home/syaprata/api/.htaccess

PassengerEnabled On
PassengerAppEnv production
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs /usr/bin/node

# Security
<FilesMatch "^\.env|^\.git">
    Order allow,deny
    Deny from all
</FilesMatch>

# CORS Headers (untuk Web BFF)
Header set Access-Control-Allow-Origin "https://syapratama.tech"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

### 4. Setup Subdomain untuk API

**cPanel → Subdomains**:
- Subdomain: `api`
- Domain: `syapratama.tech`
- Document Root: `/home/syaprata/api`

Result: `https://api.syapratama.tech`

---

## Environment Variables (.env.production)

### Web Frontend

```bash
# /home/syaprata/public_html/.env.production

NODE_ENV=production
PORT=3000

# API URL (internal/external)
NEXT_PUBLIC_API_URL=https://api.syapratama.tech
API_BASE_URL=http://localhost:4000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=syaprata_pasok
DB_PASSWORD=SecurePassword123!
DB_NAME=syaprata_pasokmataram
DB_SSL=false

# Upstash Redis (TCP/TLS rediss:// diturunkan dari kredensial REST)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

# Auth
JWT_SECRET=production_jwt_secret_min_32_chars_here
JWT_EXPIRY_DAYS=7

# Appwrite Storage
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=prod_project_id_here
APPWRITE_API_KEY=prod_api_key_here
APPWRITE_BUCKET_ID=kyb-documents-prod

# Solosmartpay
SOLOSMARTPAY_TOKEN=ssp_live_xxxxxx
SOLOSMARTPAY_WEBHOOK_SECRET=prod_webhook_secret
SOLOSMARTPAY_SANDBOX=false
SOLOSMARTPAY_BASE_URL=https://api.solosmartpay.com/v1

# ML Forecasting
ML_FORECAST_URL=http://localhost:8000
ML_FORECAST_TIMEOUT_MS=5000
```

### API Backend

```bash
# /home/syaprata/api/.env.production

NODE_ENV=production
PORT=4000

# Database (sama dengan Web)
DB_HOST=localhost
DB_PORT=3306
DB_USER=syaprata_pasok
DB_PASSWORD=SecurePassword123!
DB_NAME=syaprata_pasokmataram
DB_SSL=false

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

# Auth
JWT_SECRET=production_jwt_secret_min_32_chars_here
JWT_EXPIRY_DAYS=7

# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=prod_project_id_here
APPWRITE_API_KEY=prod_api_key_here
APPWRITE_BUCKET_ID=kyb-documents-prod

# Solosmartpay
SOLOSMARTPAY_TOKEN=ssp_live_xxxxxx
SOLOSMARTPAY_WEBHOOK_SECRET=prod_webhook_secret
SOLOSMARTPAY_SANDBOX=false
SOLOSMARTPAY_BASE_URL=https://api.solosmartpay.com/v1

# ML Forecasting
ML_FORECAST_URL=http://localhost:8000
ML_FORECAST_TIMEOUT_MS=5000
```

---

## Database Setup

### MySQL via cPanel

```sql
-- 1. Create Database
CREATE DATABASE syaprata_pasokmataram 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 2. Create User
CREATE USER 'syaprata_pasok'@'localhost' 
  IDENTIFIED BY 'SecurePassword123!';

-- 3. Grant Privileges
GRANT ALL PRIVILEGES ON syaprata_pasokmataram.* 
  TO 'syaprata_pasok'@'localhost';

FLUSH PRIVILEGES;
```

### Run Migrations

```bash
ssh syaprata@syapratama.tech -p 21098

cd ~/public_html

# Run migrations
mysql -u syaprata_pasok -p syaprata_pasokmataram < packages/database/migrations/001_initial_schema.sql
mysql -u syaprata_pasok -p syaprata_pasokmataram < packages/database/migrations/002_add_hub_operators_table.sql
mysql -u syaprata_pasok -p syaprata_pasokmataram < packages/database/migrations/003_add_payment_invoices_table.sql
mysql -u syaprata_pasok -p syaprata_pasokmataram < packages/database/migrations/004_add_webhook_events_table.sql
mysql -u syaprata_pasok -p syaprata_pasokmataram < packages/database/migrations/005_add_terms_acceptances_table.sql
mysql -u syaprata_pasok -p syaprata_pasokmataram < packages/database/migrations/006_deprecate_escrow_settlements.sql
```

---

## Redis Setup

Cache, antrean, dan distributed lock memakai Upstash Redis via TLS. Tidak ada Redis lokal yang perlu dipasang di server.

```bash
# Upstash Console -> Connect -> isi dua nilai ini di .env.production server
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
```

URL TCP `rediss://` diturunkan otomatis dari pasangan variabel tersebut.

---

## Process Management

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start Web
cd ~/public_html
pm2 start server.js --name pasokmataram-web --env production

# Start API
cd ~/api
pm2 start server.js --name pasokmataram-api --env production --port 4000

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup
# Copy-paste command output dan jalankan

# Monitor
pm2 status
pm2 logs pasokmataram-web
pm2 logs pasokmataram-api
```

### Using Passenger (cPanel Default)

```bash
# Restart via .htaccess
cd ~/public_html
mkdir -p tmp && touch tmp/restart.txt

cd ~/api
mkdir -p tmp && touch tmp/restart.txt
```

---

## ML Forecasting Service Deployment

### Option 1: Python Hosting (PythonAnywhere, Railway)

```bash
# Deploy ke PythonAnywhere atau Railway.app
# Update ML_FORECAST_URL di .env.production
ML_FORECAST_URL=https://ml-forecast.railway.app
```

### Option 2: VPS Terpisah

```bash
# Jika punya VPS terpisah
ssh vps-server
cd /opt/ml-forecasting
git clone repo
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Systemd service
sudo nano /etc/systemd/system/ml-forecast.service
```

### Option 3: Skip ML (Development Only)

```bash
# Matikan ML forecasting sementara
ML_FORECAST_URL=
ML_FORECAST_ENABLED=false
```

---

## Monitoring & Troubleshooting

### Check Logs

```bash
# PM2 logs
pm2 logs pasokmataram-web --lines 50
pm2 logs pasokmataram-api --lines 50

# cPanel Passenger logs
cat ~/logs/pasokmataram-web.log
cat ~/logs/pasokmataram-api.log

# MySQL slow query log
tail -f /var/log/mysql/slow-query.log
```

### Health Checks

```bash
# Web
curl https://syapratama.tech
curl https://syapratama.tech/api/health

# API
curl https://api.syapratama.tech/health

# Database
mysql -u syaprata_pasok -p syaprata_pasokmataram -e "SELECT 1"

# Redis
redis-cli ping
```

### Common Issues

**1. Port Already in Use**:
```bash
pm2 stop pasokmataram-api
lsof -ti:4000 | xargs kill -9
pm2 start pasokmataram-api
```

**2. Permission Issues**:
```bash
chmod +x ~/public_html/server.js
chmod +x ~/api/server.js
chmod 755 ~/public_html
chmod 755 ~/api
```

**3. Node Modules Missing**:
```bash
cd ~/api
npm ci --production
```

**4. Environment Not Loaded**:
```bash
# Verify .env.production exists
cat ~/api/.env.production

# Check process env
pm2 describe pasokmataram-api | grep env
```

---

## Performance Optimization

### 1. Enable Gzip Compression

```apache
# .htaccess
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>
```

### 2. Cache Static Assets

```apache
# .htaccess
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 3. Database Connection Pooling

`getClient()` wraps `pool.getConnection()` with bounded exponential backoff and jitter (`dbRetry` defaults: 5 retries, 100 ms base delay, 2,000 ms cap). Migration and seed scripts retry connection creation only; they do not replay SQL statements.

`GET /health/db` returns HTTP 200 when MySQL responds and HTTP 503 after retry exhaustion.

### 4. Redis Caching

```typescript
// Implement caching for forecast results
const cached = await redis.get(`forecast:${commodity}`);
if (cached) return JSON.parse(cached);
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Set proper file permissions (755 dirs, 644 files)
- [ ] Protect .env files via .htaccess
- [ ] Enable HTTPS (SSL certificate via cPanel/Let's Encrypt)
- [ ] Configure CORS headers properly
- [ ] Set up firewall rules (if VPS)
- [ ] Enable Redis password authentication
- [ ] Restrict MySQL remote access
- [ ] Setup fail2ban (if VPS)
- [ ] Regular backup cron jobs

---

## Backup Strategy

### Database Backup (Cron)

```bash
# cPanel → Cron Jobs
# Daily at 2 AM
0 2 * * * mysqldump -u syaprata_pasok -p'SecurePassword123!' syaprata_pasokmataram | gzip > ~/backups/db-$(date +\%Y\%m\%d).sql.gz

# Keep last 7 days only
0 3 * * * find ~/backups -name "db-*.sql.gz" -mtime +7 -delete
```

### Files Backup

```bash
# Weekly backup
0 3 * * 0 tar -czf ~/backups/files-$(date +\%Y\%m\%d).tar.gz ~/public_html ~/api
```

---

## Summary

**Deployment Flow**:
1. ✅ GitHub Actions build & deploy (automated)
2. ✅ Extract artifacts to public_html & api/
3. ✅ Setup .env.production
4. ✅ Run migrations
5. ✅ Configure Passenger/PM2
6. ✅ Monitor logs & health

**Access URLs**:
- Web: https://syapratama.tech
- API: https://api.syapratama.tech
- Health: https://api.syapratama.tech/health

**Services**:
- ✅ Auth & Settlement (inline di apps/api)
- ✅ Pooling & Logistics (direct import, no separate process)
- ⚠️ ML Forecasting (deploy terpisah atau skip)
