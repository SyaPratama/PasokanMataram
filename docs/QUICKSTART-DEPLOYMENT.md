# Quick Start Deployment - PasokMataram

Panduan cepat deploy monolith architecture ke shared hosting dalam 15 menit.

---

## Prerequisites Checklist

- [ ] Shared hosting dengan Node.js 20.x support
- [ ] SSH access
- [ ] MySQL 8.0+ database
- [ ] Redis (optional tapi recommended)
- [ ] Git repository access
- [ ] 15 menit waktu deployment

---

## Method 1: GitHub Actions (5 menit setup, auto-deploy forever)

### Step 1: Setup GitHub Secrets (2 menit)

Repository Settings → Secrets and variables → Actions:

```bash
SSH_HOST=syapratama.tech
SSH_USER=syaprata
SSH_PASSWORD=your_password
SSH_PORT=21098
WEB_DEPLOY_PATH=/home/syaprata/public_html
API_DEPLOY_PATH=/home/syaprata/api
```

Set environment secret (multiline mentah, bukan base64):
```bash
gh secret set ENV_PRODUCTION < apps/web/.env.production
```

Pastikan `.env.production` memuat `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN`; pipeline menolak deploy tanpa keduanya.

### Step 2: Trigger Deployment (1 menit)

```bash
# Push ke main branch
git push origin main

# Atau manual dispatch
gh workflow run deploy.yml

# Monitor
gh run watch
```

### Step 3: Configure Server (2 menit)

```bash
ssh syaprata@syapratama.tech -p 21098

# Setup subdomain API
# cPanel → Subdomains → Create: api.syapratama.tech → /home/syaprata/api

# Start PM2
pm2 start ~/api/server.js --name pasokmataram-api
pm2 save
pm2 startup  # Copy-paste command output

# Web via Passenger (auto-start via .htaccess)
cd ~/public_html
mkdir -p tmp && touch tmp/restart.txt
```

**Done! ✅**
- Web: https://syapratama.tech
- API: https://api.syapratama.tech

---

## Method 2: Manual SSH (15 menit one-time)

### Step 1: Build Locally (3 menit)

```bash
# Install dependencies
npm ci

# Build
npm run build -- --filter=@pasok/web
npm run build -- --filter=@pasok/api

# Bundle API
npx esbuild apps/api/src/main.ts \
  --bundle --platform=node --target=node20 \
  --format=esm --packages=external \
  --outfile=apps/api/dist/main.js
```

### Step 2: Package (2 menit)

```bash
# Web
cd apps/web
tar -czf ~/web-build.tar.gz \
  .next/standalone \
  .next/static \
  public \
  .env.production

# API
cd ../api
tar -czf ~/api-build.tar.gz \
  dist/main.js \
  package.json \
  .env.production
```

### Step 3: Upload (3 menit)

```bash
# Upload files
scp -P 21098 ~/web-build.tar.gz syaprata@syapratama.tech:~/
scp -P 21098 ~/api-build.tar.gz syaprata@syapratama.tech:~/
```

### Step 4: Extract & Configure (5 menit)

```bash
ssh syaprata@syapratama.tech -p 21098

# Extract Web
cd ~/public_html
tar -xzf ~/web-build.tar.gz
rm ~/web-build.tar.gz

# Setup Web entry point
cat > server.js << 'EOF'
import fs from 'fs';
const env = '.env.production';
if (fs.existsSync(env)) {
  const content = fs.readFileSync(env, 'utf8');
  for (const line of content.split('\n')) {
    const [key, ...val] = line.split('=');
    if (key && val.length) process.env[key.trim()] = val.join('=').trim();
  }
}
import('./apps/web/server.js');
EOF

# Extract API
mkdir -p ~/api
cd ~/api
tar -xzf ~/api-build.tar.gz
npm ci --production
rm ~/api-build.tar.gz

# Setup API entry point
cat > server.js << 'EOF'
import fs from 'fs';
const env = '.env.production';
if (fs.existsSync(env)) {
  const content = fs.readFileSync(env, 'utf8');
  for (const line of content.split('\n')) {
    const [key, ...val] = line.split('=');
    if (key && val.length) process.env[key.trim()] = val.join('=').trim();
  }
}
import('./dist/main.js');
EOF

# Start services
pm2 start ~/api/server.js --name pasokmataram-api --env production
pm2 save

# Web via Passenger
cd ~/public_html
mkdir -p tmp && touch tmp/restart.txt
```

### Step 5: Database Setup (2 menit)

```bash
# cPanel → MySQL Databases
# Create: syaprata_pasokmataram
# User: syaprata_pasok
# Grant all privileges

# Run migrations
mysql -u syaprata_pasok -p syaprata_pasokmataram < ~/public_html/packages/database/migrations/001_initial_schema.sql
# ... (jalankan semua migrations)
```

**Done! ✅**

---

## Environment Variables Template

### Web (.env.production)

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.syapratama.tech
API_BASE_URL=http://localhost:4000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=syaprata_pasok
DB_PASSWORD=SecurePassword123!
DB_NAME=syaprata_pasokmataram

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

# Auth
JWT_SECRET=production_secret_min_32_chars
JWT_EXPIRY_DAYS=7

# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=prod_project_id
APPWRITE_API_KEY=prod_api_key
APPWRITE_BUCKET_ID=kyb-documents-prod

# Solosmartpay
SOLOSMARTPAY_TOKEN=ssp_live_xxxxxx
SOLOSMARTPAY_WEBHOOK_SECRET=webhook_secret
SOLOSMARTPAY_SANDBOX=false

# ML Forecasting (optional)
ML_FORECAST_URL=http://localhost:8000
```

### API (.env.production)

```bash
NODE_ENV=production
PORT=4000

# Database (same as Web)
DB_HOST=localhost
DB_PORT=3306
DB_USER=syaprata_pasok
DB_PASSWORD=SecurePassword123!
DB_NAME=syaprata_pasokmataram

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

# Auth (same secrets as Web)
JWT_SECRET=production_secret_min_32_chars
JWT_EXPIRY_DAYS=7

# Appwrite (same as Web)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=prod_project_id
APPWRITE_API_KEY=prod_api_key
APPWRITE_BUCKET_ID=kyb-documents-prod

# Solosmartpay (same as Web)
SOLOSMARTPAY_TOKEN=ssp_live_xxxxxx
SOLOSMARTPAY_WEBHOOK_SECRET=webhook_secret
SOLOSMARTPAY_SANDBOX=false
```

---

## Health Check

```bash
# Web
curl https://syapratama.tech/api/health

# API
curl https://api.syapratama.tech/health

# Expected response
{"status":"ok","timestamp":"2026-11-03T11:59:28.212Z","services":{"database":"connected","redis":"connected"}}
```

---

## Common Issues & Quick Fixes

### "Cannot connect to database"

```bash
# Check MySQL running
mysql -u syaprata_pasok -p

# Grant privileges
mysql -u root -p
GRANT ALL PRIVILEGES ON syaprata_pasokmataram.* TO 'syaprata_pasok'@'localhost';
FLUSH PRIVILEGES;
```

### "Port 4000 already in use"

```bash
pm2 stop pasokmataram-api
lsof -ti:4000 | xargs kill -9
pm2 start pasokmataram-api
```

### "Module not found"

```bash
cd ~/api
npm ci --production
pm2 restart pasokmataram-api
```

### "502 Bad Gateway"

```bash
# Web Passenger restart
cd ~/public_html
mkdir -p tmp && touch tmp/restart.txt

# API PM2 restart
pm2 restart pasokmataram-api
pm2 logs pasokmataram-api --lines 50
```

---

## Daily Operations

### View Logs

```bash
# API logs
pm2 logs pasokmataram-api

# Web logs (Passenger)
tail -f ~/logs/pasokmataram-web.log
```

### Restart Services

```bash
# API
pm2 restart pasokmataram-api

# Web
cd ~/public_html && mkdir -p tmp && touch tmp/restart.txt
```

### Update Deployment

```bash
# GitHub Actions (automatic)
git push origin main

# Manual
# 1. Build locally → 2. Upload tarball → 3. Extract → 4. Restart
```

---

## Next Steps

- [ ] Setup SSL certificate (cPanel → SSL/TLS → Let's Encrypt)
- [ ] Configure cron jobs for backups
- [ ] Setup monitoring alerts
- [ ] Test all critical flows
- [ ] Document custom configurations

**Full Documentation**:
- [Shared Hosting Deployment](./SHARED-HOSTING-DEPLOYMENT.md)
- [CI/CD Pipeline](./CI-CD-PIPELINE.md)
- [Service Access Patterns](./SERVICE-ACCESS.md)
- [Monolith Migration](./MONOLITH-MIGRATION.md)

---

**Deployment Time**: 5 menit (GitHub Actions) atau 15 menit (Manual SSH)
