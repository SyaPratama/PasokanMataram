# Manual Deployment Guide

## Prerequisites
- Node.js 20.x installed on server
- PostgreSQL 16 running
- Redis 7 running
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
DB_PORT=5432
DB_NAME=pasokmataram_db
DB_USER=pasokmataram_user
DB_PASSWORD=your_secure_password
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secure_jwt_secret_minimum_32_chars
```

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
