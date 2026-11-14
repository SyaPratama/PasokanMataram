# Manual Deployment Guide

## Prerequisites
- Node.js 20.x installed on server
- MySQL 8.0 running
- Redis 7 running
- Appwrite project configured (Cloud or self-hosted)
- PM2 installed globally: `npm install -g pm2`

## Deployment Methods

### Method 1: Git Pull on Server (Recommended)

1. **First time setup:**
```bash
ssh user@syapratama.tech
cd ~
git clone https://github.com/SyaPratama/PasokanMataram.git
cd PasokanMataram
npm ci
npm run build
```

2. **Deploy updates:**
```bash
ssh user@syapratama.tech
cd ~/PasokanMataram
git pull origin main
npm ci --production
npm run build
pm2 restart pasokmataram-web || pm2 start npm --name "pasokmataram-web" -- start
pm2 save
```

### Method 2: FTP/SFTP Upload

1. Build locally:
```bash
npm ci
npm run build
```

2. Upload via FileZilla/WinSCP:
   - Upload `apps/web/.next/` folder
   - Upload `package.json`, `package-lock.json`
   - Upload all modified source files

3. SSH to server and restart:
```bash
cd /path/to/pasokmataram
npm ci --production
pm2 restart pasokmataram-web
```

### Method 3: cPanel Node.js App

1. Login to cPanel → Setup Node.js App
2. Configure:
   - Node.js version: 20.x
   - Application root: `/home/user/pasokmataram`
   - Application startup file: `apps/web/server.js` or `npm start`
3. Install dependencies via cPanel terminal
4. Restart application

## Environment Variables

Create `.env.production` on server:
```bash
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pasokmataram_prod
DB_USER=pasokmataram_user
DB_PASSWORD=your_secure_password
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
JWT_SECRET=your_secure_jwt_secret_minimum_32_chars
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_production_project_id
APPWRITE_API_KEY=your_production_api_key
APPWRITE_BUCKET_ID=kyb-documents-prod
```

## Solosmartpay Payment Gateway Setup

PasokMataram uses Solosmartpay for multi-channel payment processing (QRIS, Virtual Accounts).

### 1. Obtain API Credentials

Contact Solosmartpay merchant support to receive:
- API Token (format: `ssp_live_xxxxx` for production, `ssp_test_xxxxx` for sandbox)
- Webhook Secret (HMAC-SHA256 signing key)

### 2. Configure Environment Variables

Add to `.env.production`:
```bash
SOLOSMARTPAY_TOKEN=ssp_live_your_token_here
SOLOSMARTPAY_WEBHOOK_SECRET=your_webhook_secret_here
SOLOSMARTPAY_SANDBOX=false
```

For development/testing, use sandbox mode:
```bash
SOLOSMARTPAY_TOKEN=ssp_test_sandbox_token
SOLOSMARTPAY_WEBHOOK_SECRET=test_webhook_secret
SOLOSMARTPAY_SANDBOX=true
```

### 3. Register Webhook Endpoint

In Solosmartpay merchant dashboard, configure webhook URL:
```
https://pasok.syapratama.tech/api/v1/webhooks/solosmartpay
```

Webhook events subscribed:
- `payment.success` - Payment completed successfully
- `payment.failed` - Payment failed or rejected
- `payment.expired` - Payment invoice expired (default 24h)

### 4. Apply Database Migrations

Run payment gateway migrations:
```bash
mysql -u pasokmataram_user -p pasokmataram_prod < packages/database/migrations/003_add_payment_invoices_table.sql
mysql -u pasokmataram_user -p pasokmataram_prod < packages/database/migrations/004_add_webhook_events_table.sql
mysql -u pasokmataram_user -p pasokmataram_prod < packages/database/migrations/005_add_terms_acceptances_table.sql
mysql -u pasokmataram_user -p pasokmataram_prod < packages/database/migrations/006_deprecate_escrow_settlements.sql
```

### 5. Verification

Test payment invoice creation:
```bash
curl -X POST https://pasok.syapratama.tech/api/settlement/invoice \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500000,
    "reference": "TEST001",
    "description": "Test payment",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "paymentMethod": "QRIS"
  }'
```

Expected response: Invoice with `invoiceId`, `qrCode`, and `paymentUrl`.

### Fee Structure

Solosmartpay dual-rail fee model (PayFac compliant):
- Buyer service fee: 0.3% (charged to buyer)
- Merchant platform fee: 0.5% (deducted from seller payout)

Example: Rp 500.000 transaction
- Buyer pays: Rp 501.500 (base + 0.3%)
- Seller receives: Rp 497.500 (base - 0.5%)



## Appwrite Storage Setup

KYB document storage uses Appwrite Storage with tenant isolation.

### Cloud Setup (Recommended)

1. **Create Appwrite Project:**
   - Visit https://cloud.appwrite.io
   - Create new project
   - Copy Project ID

2. **Generate API Key:**
   - Go to Project Settings → API Keys
   - Create new key with Storage permissions (read, write, create, delete)
   - Copy API Key (starts with `standard_...`)

3. **Create Storage Bucket:**
   - Navigate to Storage → Create Bucket
   - Bucket ID: `kyb-documents-prod` (or `kyb-documents-dev`)
   - Max file size: 5 MB
   - Allowed file extensions: `pdf,webp,jpeg,jpg,png`
   - Compression: Disabled
   - Encryption: Enabled

4. **Set Bucket Permissions:**
   - Read: API Key (server-side only, no public access)
   - Write: API Key
   - Delete: API Key
   - Update: API Key

### Self-Hosted Setup (Advanced)

If using self-hosted Appwrite instance:

```bash
docker run -d \
  --name appwrite \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume appwrite-data:/storage \
  -p 80:80 -p 443:443 \
  appwrite/appwrite:latest
```

Update `APPWRITE_ENDPOINT` to your self-hosted URL (e.g., `https://appwrite.yourdomain.com/v1`).

### Verification

Test Appwrite connectivity:
```bash
curl -X GET \
  https://cloud.appwrite.io/v1/storage/buckets/kyb-documents-prod \
  -H "X-Appwrite-Project: YOUR_PROJECT_ID" \
  -H "X-Appwrite-Key: YOUR_API_KEY"
```

Expected response: Bucket metadata JSON.
## Post-Deployment

1. **Health check:**
```bash
curl https://pasok.syapratama.tech
```

2. **Check logs:**
```bash
pm2 logs pasokmataram-web
```

3. **Monitor:**
```bash
pm2 monit
```

## Troubleshooting

**Build fails:**
- Check Node.js version: `node -v` (should be 20.x)
- Clear cache: `rm -rf .next .turbo node_modules && npm ci`

**PM2 not found:**
```bash
npm install -g pm2
```

**Port already in use:**
```bash
pm2 stop pasokmataram-web
lsof -ti:3000 | xargs kill -9
pm2 start pasokmataram-web
```

## CI/CD Deployment

GitHub Actions deployment is configured in `.github/workflows/deploy.yml`:
- Uses pure Next.js standalone and bundled API artifacts (no raw TS source code uploaded).
- Uploads via standard SCP and SSH.
- Triggers LiteSpeed / Phusion Passenger reload via `tmp/restart.txt`.
- Exclusively runs on branch `main`.

## Support & Contact

For technical questions, infrastructure support, and inquiries:
- **Email**: `tama@syapratama.tech`
