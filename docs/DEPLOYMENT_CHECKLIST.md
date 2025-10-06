# Deployment Checklist for Vercel

## ✅ Pre-Deployment (Completed)

- [x] Fixed React Refresh plugin issue in craco.config.js
- [x] Build passes successfully locally
- [x] Committed all changes to Git
- [x] Pushed to GitHub repository

## 📋 Vercel Frontend Deployment Steps

### 1. Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

```env
# Required
REACT_APP_API_URL=<YOUR_BACKEND_API_URL>
REACT_APP_ADMIN_PASSWORD=<YOUR_SECURE_PASSWORD>

# Optional
REACT_APP_ORCID_ID=0009-0005-5213-9834
```

**Important Notes:**

- ❌ **DO NOT** add `REACT_APP_SANITY_TOKEN` anymore (we removed Sanity!)
- Replace `<YOUR_BACKEND_API_URL>` with your actual backend URL
- Replace `<YOUR_SECURE_PASSWORD>` with a strong password for dashboard access

### 2. Deploy to Vercel

**Option A: Automatic Deploy (Recommended)**

- Vercel will automatically detect the GitHub push
- Check your Vercel dashboard for the deployment status
- The build should now pass without React Refresh errors ✅

**Option B: Manual Deploy**

```bash
# If you have Vercel CLI installed
vercel --prod
```

### 3. Post-Deployment Verification

After deployment, test these features:

- [ ] Home page loads correctly
- [ ] Navigation works
- [ ] ORCID publications display
- [ ] Contact form works (if using backend)
- [ ] Dashboard login works with your password
- [ ] Resume download button shows (will need backend + database setup)

## 🖥️ Backend API Deployment (Required for Full Functionality)

### Backend Must Be Deployed For:

- Resume management (upload, download, delete)
- Dashboard content managers
- Contact form submissions
- Any database-dependent features

### Backend Deployment Options:

#### Option 1: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy from backend_api folder
cd backend_api
railway up
```

#### Option 2: Render

1. Go to render.com
2. Create new "Web Service"
3. Connect your GitHub repo
4. Set root directory to `backend_api`
5. Build command: `npm install && npx prisma generate`
6. Start command: `node server.js`

#### Option 3: Heroku

```bash
# From backend_api folder
heroku create your-portfolio-api
git subtree push --prefix backend_api heroku master
```

### Backend Environment Variables

```env
DATABASE_URL=mysql://username:password@host:port/database
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## 🗄️ Database Migration (Critical!)

**Before backend works, you MUST run the migration:**

```bash
cd backend_api

# Connect to your production database
# Option 1: SSH tunnel to your server
ssh -L 3307:localhost:3306 hetawk@31.97.41.230 -p 7722

# Option 2: Update DATABASE_URL to point to production

# Run migration
npx prisma migrate deploy

# Or create a new migration
npx prisma migrate dev --name migrate-to-mysql-resume
```

This will update your Resume table structure to support file uploads.

## 📦 Install Missing Backend Dependencies

**Important:** Backend needs `multer` for file uploads:

```bash
cd backend_api
npm install multer
```

## 🎯 Complete Setup Order

1. **Deploy Backend** (Railway/Render/Heroku)

   - Set environment variables
   - Install dependencies (`npm install multer`)
   - Run database migration

2. **Update Vercel Environment Variables**

   - Add `REACT_APP_API_URL` with your backend URL
   - Add `REACT_APP_ADMIN_PASSWORD`

3. **Redeploy Frontend** (if environment variables changed)

   - Trigger redeployment in Vercel dashboard
   - Or push a new commit to GitHub

4. **Test Everything**
   - Login to dashboard at `your-app.vercel.app/dashboard`
   - Upload a resume PDF
   - Mark it as active
   - Check if download button appears on homepage

## 🔧 Using EKD Digital Assets Server (Future)

You mentioned using an external assets server. To implement:

1. Update `backend_api/routes/resume.routes.js`
2. Replace local file storage with API calls to your assets server
3. Store returned URL in database instead of local path

Example modification:

```javascript
// Instead of saving file locally
const uploadData = new FormData();
uploadData.append("file", formData.file);

const response = await fetch("https://assets.ekddigital.com/upload", {
  method: "POST",
  body: uploadData,
});

const { fileUrl } = await response.json();

// Save fileUrl to database
const resume = await prisma.resume.create({
  data: {
    title,
    description,
    fileUrl, // URL from assets server
    fileName: req.file.originalname,
    isActive,
  },
});
```

## ⚠️ Common Issues & Solutions

### Issue: "Cannot find module 'multer'"

**Solution:** Run `npm install multer` in backend_api folder

### Issue: "Resume table doesn't exist"

**Solution:** Run `npx prisma migrate deploy` in backend_api folder

### Issue: "Dashboard login fails"

**Solution:** Check `REACT_APP_ADMIN_PASSWORD` is set in Vercel

### Issue: "Resume download doesn't work"

**Solution:**

1. Backend must be deployed and running
2. Database must be migrated
3. `REACT_APP_API_URL` must point to backend

### Issue: "CORS errors"

**Solution:** Update `FRONTEND_URL` in backend .env to match your Vercel URL

## ✨ Success Criteria

Your deployment is successful when:

- ✅ Vercel build completes without errors
- ✅ Frontend loads on your custom domain
- ✅ Dashboard login works
- ✅ Can upload resumes via dashboard
- ✅ Resume download button appears
- ✅ Can download uploaded resumes
- ✅ No console errors

---

**Next Command:** Verify Vercel deployment status
**Estimated Time:** 5-10 minutes for Vercel, 15-20 minutes for complete setup
