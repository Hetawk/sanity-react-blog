# Migration from Sanity CMS to MySQL/Prisma

## Date: October 4, 2025

## Overview

Successfully migrated the portfolio from Sanity CMS to MySQL database with Prisma ORM for resume management and content storage.

## Changes Made

### 1. Backend Changes

#### Schema Update (`backend_api/prisma/schema.prisma`)

- **Updated Resume model** to support file uploads:
  ```prisma
  model Resume {
    id          String   @id @default(uuid())
    title       String   // Resume title/name
    description String?  @db.Text
    fileUrl     String?  // URL to the uploaded PDF file
    fileName    String?  // Original filename
    isActive    Boolean  @default(false) // Mark which resume is currently active
    uploadedAt  DateTime @default(now())
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }
  ```

#### Resume Routes (`backend_api/routes/resume.routes.js`)

- Added file upload support using `multer`
- **New endpoints:**
  - `POST /api/resumes/upload` - Upload resume PDF files
  - `PATCH /api/resumes/:id` - Update resume (mark as active/inactive)
  - `DELETE /api/resumes/:id` - Delete resume and associated file
  - `GET /api/resumes` - Get all resumes
  - `GET /api/resumes/:id` - Get single resume

#### Server Configuration (`backend_api/server.js`)

- Added static file serving for uploaded resumes:
  ```javascript
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  ```

### 2. Frontend Changes

#### Resume Download Component (`src/components/ResumeDownload/ResumeDownload.jsx`)

- **Removed:** Sanity client dependency
- **Updated:** Fetch resumes from MySQL API (`/api/resumes`)
- **Simplified:** File URL handling (direct links to uploaded PDFs)

#### Authentication Context (`src/context/AuthContext.jsx`)

- **Removed:** Sanity authentication (`authClient`, `sanityToken`)
- **Simplified:** Password-only authentication
- **Environment Variables:** Now only requires `REACT_APP_ADMIN_PASSWORD`

#### Resume Manager (`src/pages/Dashboard/ContentManagers/ResumeManager.jsx`)

- **Complete rewrite** to use MySQL API instead of Sanity
- **Features:**
  - Upload PDF files directly to backend
  - Mark resumes as active/inactive
  - Delete resumes
  - View uploaded resumes
- **Removed:** Sanity client, token management, display location settings

### 3. Build Configuration

#### Craco Config (`craco.config.js`)

- **Fixed:** React Refresh plugin issue in production builds
- **Added:** Babel plugin filtering to disable react-refresh in production
- **Added:** ReactRefreshPlugin removal in production webpack config

## Environment Variables

### Frontend (No Longer Needed)

- ~~`REACT_APP_SANITY_TOKEN`~~ ❌ Removed

### Frontend (Still Required)

- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_ADMIN_PASSWORD` - Dashboard authentication password
- `REACT_APP_ORCID_ID` - ORCID identifier (optional)

### Backend (Required)

- `DATABASE_URL` - MySQL connection string
- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

## File Storage

### Current Setup

- Resumes are stored locally in `backend_api/uploads/resumes/`
- Files are served statically at `/uploads/resumes/:filename`

### Future: EKD Digital Assets Server

- Plan to migrate file storage to external assets server
- Backend already supports URL-based file references
- Will only need to update upload endpoint to use external storage

## Database Migration Required

**IMPORTANT:** You must run Prisma migration to update the database schema:

```bash
cd backend_api
npx prisma migrate dev --name update-resume-model
```

This will:

1. Drop old resume columns (name, email, phone, summary, experience, education, skills)
2. Add new resume columns (title, description, fileUrl, fileName, isActive, uploadedAt)

## Testing Checklist

- [x] Build passes successfully
- [ ] Backend starts without errors
- [ ] Database migration successful
- [ ] Resume upload works
- [ ] Resume download works
- [ ] Dashboard authentication works
- [ ] Active resume marking works
- [ ] Resume deletion works

## Deployment Notes

### Vercel Environment Variables

Set these in your Vercel project settings:

- `REACT_APP_API_URL` = Your backend API URL
- `REACT_APP_ADMIN_PASSWORD` = Your chosen dashboard password

### Backend Deployment

- Deploy `backend_api` folder to your hosting service
- Ensure MySQL database is accessible
- Set environment variables on hosting platform
- Create `uploads/resumes` directory with write permissions

## Benefits of This Migration

1. **Simplified Authentication** - No more Sanity token management
2. **Direct Control** - Full control over file storage and database
3. **Cost Savings** - No Sanity CMS subscription needed
4. **Performance** - Direct database queries, no external API calls
5. **Flexibility** - Easy to extend with custom features

## Removed Files

- `src/client.js` - Sanity client configuration (can be deleted)
- `backend_sanity/` - Old Sanity backend (already gitignored)

## Next Steps

1. ✅ Commit all changes
2. ✅ Push to GitHub
3. ⬜ Run database migration on production
4. ⬜ Deploy backend API
5. ⬜ Deploy frontend to Vercel
6. ⬜ Upload resume files via dashboard
7. ⬜ Migrate to EKD Digital Assets server (future)

---

**Migration Status:** ✅ Complete and ready for deployment
**Build Status:** ✅ Passing
**Database Migration:** ⚠️ Pending
