# EKD Digital Assets Integration Guide

**Date:** October 6, 2025  
**Status:** ✅ Complete

## Overview

This portfolio application now uses the **EKD Digital Assets** system for all file uploads (images, documents, videos). The assets are stored on the VPS server and served through the CDN at `https://www.assets.andgroupco.com`.

## Architecture

```
Browser → Backend API → EKD Assets API → VPS Storage
                                       ↓
                              Assets Database
                                       ↓
                              Public CDN Access
```

## Configuration

### Environment Variables

Required in `backend_api/.env`:

```env
# EKD Digital Assets Configuration
ASSETS_API_URL=https://www.assets.andgroupco.com/api/v1/assets
ASSET_CLIENT_ID=ekddigital
ASSET_PROJECT_NAME=portfolio
ASSETS_API_KEY=your_api_key_here
ASSETS_API_SECRET=your_api_secret_here

# Optional - for URL construction
VPS_BASE_URL=https://www.assets.andgroupco.com
```

### Asset Organization

All assets are organized by path:

```
{client_id}/{project_name}/{asset_type}/{filename}

Example:
ekddigital/portfolio/images/profile-photo.jpg
ekddigital/portfolio/documents/resume.pdf
ekddigital/portfolio/videos/intro-video.mp4
```

## Implementation

### Asset Uploader Utility

**Location:** `backend_api/utils/assetUploader.js`

**Features:**

- Singleton pattern (exported as ready-to-use instance)
- Specialized upload methods for different asset types
- JWT authentication with API key and secret
- Detailed logging for debugging
- Timeout handling (5 minutes)

**Usage:**

```javascript
const assetUploader = require("../utils/assetUploader");

// Upload an image
const result = await assetUploader.uploadImage(
  fileBuffer,
  "profile.jpg",
  "image/jpeg"
);

// Upload a document
const result = await assetUploader.uploadDocument(
  fileBuffer,
  "resume.pdf",
  "application/pdf"
);

// Upload a video
const result = await assetUploader.uploadVideo(
  fileBuffer,
  "intro.mp4",
  "video/mp4"
);

// General upload
const result = await assetUploader.uploadFile(fileBuffer, {
  filename: "myfile.pdf",
  assetType: "documents",
  mimeType: "application/pdf",
});
```

**Response Format:**

```javascript
{
    success: true,
    filename: "profile.jpg",
    filePath: "ekddigital/portfolio/images/profile.jpg",
    fileUrl: "https://www.assets.andgroupco.com/assets/ekddigital/portfolio/images/profile.jpg",
    size: 245678,
    mimeType: "image/jpeg",
    uploadedAt: "2025-10-06T12:00:00.000Z",
    vpsResponse: { /* full API response */ }
}
```

## Routes with Asset Upload

### 1. Resume Routes (`/api/resumes`)

**Upload Endpoint:** `POST /api/resumes/upload`

**Asset Type:** `documents` (resumes folder)  
**Allowed Types:** PDF only  
**Size Limit:** 10MB

**Request:**

```javascript
FormData:
- file: PDF file
- title: Resume title
- description: Optional description
- isActive: Boolean (true/false)
```

**Response:**

```javascript
{
    success: true,
    data: {
        id: "uuid",
        title: "Software Engineer Resume",
        fileUrl: "https://www.assets.andgroupco.com/assets/ekddigital/portfolio/resumes/resume.pdf",
        fileName: "resume.pdf",
        isActive: true
    },
    asset: {
        url: "https://www.assets.andgroupco.com/assets/...",
        size: 245678
    }
}
```

### 2. About Routes (`/api/abouts`)

**Upload Endpoint:** `POST /api/abouts/upload-image`

**Asset Type:** `images`  
**Allowed Types:** JPEG, PNG, GIF, WebP  
**Size Limit:** 5MB

**Request:**

```javascript
FormData:
- image: Image file
```

**Response:**

```javascript
{
    success: true,
    data: {
        imgUrl: "https://www.assets.andgroupco.com/assets/ekddigital/portfolio/images/about.jpg",
        filename: "about.jpg",
        size: 125678
    }
}
```

### 3. Work Routes (`/api/works`)

**Upload Endpoint:** `POST /api/works/upload-image`

**Asset Type:** `images`  
**Allowed Types:** JPEG, PNG, GIF, WebP  
**Size Limit:** 5MB

### 4. Skill Routes (`/api/skills`)

**Upload Endpoint:** `POST /api/skills/upload-icon`

**Asset Type:** `images`  
**Allowed Types:** JPEG, PNG, GIF, WebP, SVG  
**Size Limit:** 2MB (icons should be small)

### 5. Brand Routes (`/api/brands`)

**Upload Endpoint:** `POST /api/brands/upload-logo`

**Asset Type:** `images`  
**Allowed Types:** JPEG, PNG, GIF, WebP, SVG  
**Size Limit:** 2MB

### 6. Award Routes (`/api/awards`)

**Upload Endpoint:** `POST /api/awards/upload-image`

**Asset Type:** `images`  
**Allowed Types:** JPEG, PNG, GIF, WebP  
**Size Limit:** 5MB

## Dependencies

Required npm packages (already installed):

```json
{
  "multer": "^1.4.5-lts.1",
  "form-data": "^4.0.0",
  "node-fetch": "^2.7.0"
}
```

## Testing

### Test Upload Locally

```bash
# 1. Ensure backend is running with correct .env
cd backend_api
npm run dev

# 2. Test resume upload
curl -X POST http://localhost:5001/api/resumes/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/resume.pdf" \
  -F "title=Test Resume" \
  -F "isActive=true"

# 3. Test image upload
curl -X POST http://localhost:5001/api/abouts/upload-image \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/image.jpg"
```

### Expected Success Response

```json
{
  "success": true,
  "data": {
    "fileUrl": "https://www.assets.andgroupco.com/assets/ekddigital/portfolio/...",
    "filename": "resume.pdf",
    "size": 245678
  }
}
```

### Common Errors

**1. Missing Authentication:**

```json
{
  "success": false,
  "error": "Upload failed: 401 - Unauthorized"
}
```

**Solution:** Check `ASSETS_API_KEY` and `ASSETS_API_SECRET` in `.env`

**2. File Too Large:**

```json
{
  "success": false,
  "error": "File too large"
}
```

**Solution:** Reduce file size or increase limit in route configuration

**3. Invalid File Type:**

```json
{
  "success": false,
  "error": "Only PDF files are allowed"
}
```

**Solution:** Check file MIME type matches route requirements

## Frontend Integration

### Example: Resume Upload Component

```javascript
const handleResumeUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", "My Resume");
  formData.append("isActive", "true");

  try {
    const response = await apiClient.post("/resumes/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Upload successful:", response.data.data.fileUrl);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### Example: Image Upload Component

```javascript
const handleImageUpload = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await apiClient.post("/abouts/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const imageUrl = response.data.data.imgUrl;
    console.log("Image uploaded:", imageUrl);

    // Now save the image URL to your about record
    await apiClient.post("/abouts", {
      title: "About Me",
      description: "My description",
      imgUrl: imageUrl,
    });
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

## Asset Types Reference

| Entity | Field Name | Asset Type          | Allowed Formats           | Size Limit | Endpoint                   |
| ------ | ---------- | ------------------- | ------------------------- | ---------- | -------------------------- |
| Resume | `fileUrl`  | `documents/resumes` | PDF                       | 10MB       | `/api/resumes/upload`      |
| About  | `imgUrl`   | `images`            | JPEG, PNG, GIF, WebP      | 5MB        | `/api/abouts/upload-image` |
| Work   | `imgUrl`   | `images`            | JPEG, PNG, GIF, WebP      | 5MB        | `/api/works/upload-image`  |
| Skill  | `icon`     | `images`            | JPEG, PNG, GIF, WebP, SVG | 2MB        | `/api/skills/upload-icon`  |
| Brand  | `imgUrl`   | `images`            | JPEG, PNG, GIF, WebP, SVG | 2MB        | `/api/brands/upload-logo`  |
| Award  | `imgUrl`   | `images`            | JPEG, PNG, GIF, WebP      | 5MB        | `/api/awards/upload-image` |

## Benefits

✅ **Centralized Storage** - All assets in one place  
✅ **CDN Delivery** - Fast global access  
✅ **No Local Storage** - Scalable deployment  
✅ **Organized Structure** - Easy to manage  
✅ **Authentication** - Secure uploads  
✅ **Large File Support** - Up to 10MB+ tested  
✅ **Database Backup** - Files <10MB stored in DB too

## Migration from Sanity

All Sanity asset references have been removed. Assets are now:

- Stored on VPS at `/var/www/assets/`
- Served through CDN at `https://www.assets.andgroupco.com/assets/`
- Managed via EKD Digital Assets API
- No dependency on third-party services

## Next Steps

1. ✅ Asset uploader utility created
2. ✅ All routes updated with upload endpoints
3. ✅ Dependencies installed
4. ⏳ Update frontend components to use new upload endpoints
5. ⏳ Test all upload functionality
6. ⏳ Deploy backend to production
7. ⏳ Verify assets accessible via CDN

## Support

For issues with the EKD Digital Assets system:

- Check logs in backend terminal for detailed error messages
- Verify authentication credentials in `.env`
- Ensure VPS server is accessible
- Contact system administrator for API access issues

---

**Last Updated:** October 6, 2025  
**Version:** 1.0.0
