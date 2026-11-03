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
REDIS_SOCKET=/home/syaprata/redis/redis.sock
REDIS_URL=unix:///home/syaprata/redis/redis.sock
JWT_SECRET=your_secure_jwt_secret_minimum_32_chars
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_production_project_id
APPWRITE_API_KEY=your_production_api_key
APPWRITE_BUCKET_ID=kyb-documents-prod
```


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

## CI/CD Note

GitHub Actions deployment disabled due to shared hosting limitations:
- No rsync support
- SSH firewall/IP whitelist restrictions
- Manual deployment more reliable for shared hosting environments
