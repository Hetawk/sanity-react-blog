# Backend API Deployment Guide

**Date:** October 6, 2025  
**Status:** ⚠️ REQUIRED - Backend not deployed

## Problem

Your production site `https://www.ekdportfolio.ekddigital.com` is showing:

```
⚠️ Error loading content: Failed to fetch
```

**Root Cause:** The `REACT_APP_API_URL` in Vercel is set to `https://ekdportfolio.ekddigital.com` (the frontend URL), but there's no backend API deployed.

## Current Environment Variables

### ❌ WRONG Configuration (Current in Vercel):

```bash
REACT_APP_API_URL="https://ekdportfolio.ekddigital.com"  # This is the FRONTEND!
```

### ✅ CORRECT Configuration (What we need):

```bash
# Option 1: Subdomain
REACT_APP_API_URL="https://api.ekdportfolio.ekddigital.com"

# Option 2: API path
REACT_APP_API_URL="https://ekdportfolio.ekddigital.com/api"

# Option 3: VPS direct (for testing)
REACT_APP_API_URL="http://31.97.41.230:5001"
```

## Deployment Options

### Option 1: Deploy Backend on VPS with Subdomain (RECOMMENDED)

**Steps:**

1. **SSH into your VPS:**

   ```bash
   ssh -p 7722 hetawk@31.97.41.230
   ```

2. **Create backend directory:**

   ```bash
   mkdir -p /var/www/ekdportfolio-api
   cd /var/www/ekdportfolio-api
   ```

3. **Upload backend files:**

   ```bash
   # From local machine
   scp -P 7722 -r backend_api/* hetawk@31.97.41.230:/var/www/ekdportfolio-api/
   ```

4. **Install dependencies:**

   ```bash
   cd /var/www/ekdportfolio-api
   npm install
   ```

5. **Create production .env file:**

   ```bash
   nano .env
   ```

   Add:

   ````env
   DATABASE_URL="mysql://username:password@localhost:port/database"
   PORT=5001
   NODE_ENV=production
   FRONTEND_URL=https://www.ekdportfolio.ekddigital.com

   # Assets Configuration
   ASSETS_API_URL=https://www.assets.andgroupco.com/api/v1/assets
   ASSET_CLIENT_ID=your_client_id
   ASSET_PROJECT_NAME=your_project_name
   ASSETS_API_KEY=your_api_key_here
   ASSETS_API_SECRET=your_api_secret_here
   VPS_BASE_URL=https://www.assets.andgroupco.com
   ```6. **Run database migration:**

   ```bash
   npx prisma migrate deploy
   ````

6. **Install PM2 (process manager):**

   ```bash
   npm install -g pm2
   ```

7. **Start backend with PM2:**

   ```bash
   pm2 start server.js --name ekdportfolio-api
   pm2 save
   pm2 startup
   ```

8. **Configure Nginx reverse proxy:**

   ```bash
   sudo nano /etc/nginx/sites-available/api.ekdportfolio.ekddigital.com
   ```

   Add:

   ```nginx
   server {
       listen 80;
       server_name api.ekdportfolio.ekddigital.com;

       location / {
           proxy_pass http://localhost:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. **Enable site and reload Nginx:**

   ```bash
   sudo ln -s /etc/nginx/sites-available/api.ekdportfolio.ekddigital.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

10. **Add SSL with Certbot:**

    ```bash
    sudo certbot --nginx -d api.ekdportfolio.ekddigital.com
    ```

11. **Add DNS A record:**
    - Go to your DNS provider (Cloudflare, etc.)
    - Add A record: `api.ekdportfolio` → `31.97.41.230`

### Option 2: Deploy Backend on Vercel (Alternative)

**Note:** Vercel supports Node.js APIs, but you'll need serverless functions.

1. **Create `api` directory in root:**

   ```bash
   mkdir api
   ```

2. **Move routes to serverless functions:**
   Each route becomes a file in `/api/` directory

3. **Update `vercel.json`:**

   ```json
   {
     "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }]
   }
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

## Update Vercel Environment Variables

Once backend is deployed, update Vercel:

```bash
# Remove old Sanity variables
vercel env rm REACT_APP_SANITY_TOKEN production
vercel env rm SANITY_STUDIO_API_PROJECT_ID production

# Update API URL
vercel env add REACT_APP_API_URL production
# Enter: https://api.ekdportfolio.ekddigital.com

# Add ORCID ID
vercel env add REACT_APP_ORCID_ID production
# Enter: 0000-0003-4018-8579

# Redeploy frontend
vercel --prod
```

## Local Development Setup

### 1. Start Backend:

```bash
cd backend_api
npm run dev
# Backend running on http://localhost:5001
```

### 2. Start Frontend (in new terminal):

```bash
npm start
# Frontend running on http://localhost:3000
```

### 3. Test API:

```bash
curl http://localhost:5001/api/abouts
```

## Verification Checklist

After deployment:

- [ ] Backend API accessible: `https://api.ekdportfolio.ekddigital.com/api/abouts`
- [ ] Returns JSON data (not 404 or CORS error)
- [ ] Frontend `REACT_APP_API_URL` updated in Vercel
- [ ] Frontend redeployed with new env var
- [ ] About page loads without "Failed to fetch" error
- [ ] All other pages (Works, Skills, etc.) load correctly
- [ ] Old Sanity env vars removed from Vercel

## Quick Fix (Temporary - For Testing)

If you want to test quickly without full deployment:

1. **Use VPS direct (not production-ready):**

   ```bash
   # Update Vercel
   vercel env add REACT_APP_API_URL production
   # Enter: http://31.97.41.230:5001

   # Redeploy
   vercel --prod
   ```

2. **Start backend on VPS:**
   ```bash
   ssh -p 7722 hetawk@31.97.41.230
   cd /path/to/backend
   NODE_ENV=production PORT=5001 node server.js
   ```

**⚠️ Warning:** This exposes your backend without SSL and proper configuration. Use only for testing!

## Next Steps

1. **Choose deployment option** (Option 1 recommended)
2. **Deploy backend API**
3. **Update DNS if using subdomain**
4. **Update Vercel environment variables**
5. **Redeploy frontend**
6. **Test production site**

## Support Files

- Local frontend env: `.env.local`
- Local backend env: `backend_api/.env.local`
- Production backend env: `backend_api/.env.production` (create on VPS)
- Vercel env: managed via `vercel env` CLI

---

**Last Updated:** October 6, 2025  
**Status:** Waiting for backend deployment
