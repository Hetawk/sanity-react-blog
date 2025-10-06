# 🚀 Upload System - Final Architecture

## ✅ Problem Solved

**CORS errors** when uploading large files (87MB+) - Browser was trying to call external TTYD/VPS APIs directly, blocked by same-origin policy.

## 🏗️ Solution Architecture

### Upload Flow

```
Browser → /api/v1/assets/upload (Next.js API) → VPS Server → Database
         ↑                                        ↓
         └─────────── Auth Token ────────────────┘
                    (no CORS issues!)
```

### Key Changes

1. **Server-Side Proxy Pattern** ✅

   - All external API calls happen server-side in Next.js API route
   - Browser only talks to same-origin `/api/v1/assets/upload`
   - No CORS issues since server-to-server communication

2. **VPS Upload Only** ✅

   - Removed TTYD base64 file upload (too large for 87MB+ files)
   - TTYD available for future terminal commands if needed
   - VPS handles binary files efficiently without base64 bloat

3. **Performance Optimizations** ⚡
   - Skip orchestrator for large files (>50MB) - use fast path
   - Skip base64 conversion when VPS succeeds - save memory/time
   - Only store base64 in database for small files (<10MB) or VPS failures

## 📊 Upload Strategy by File Size

| Size     | Strategy        | Notes                               |
| -------- | --------------- | ----------------------------------- |
| <4MB     | Direct upload   | Through API, stored in database     |
| 4MB-10MB | VPS + DB backup | Binary to VPS, base64 in DB         |
| >10MB    | VPS only        | Binary to VPS, no DB storage        |
| >50MB    | VPS fast path   | Skip orchestrator, direct DB create |

## 🔧 Configuration

### Environment Variables Required

```bash
# VPS Upload Server
VPS_IP_ADDRESS=31.97.41.230
VPS_UPLOAD_PORT=3044
VPS_BASE_URL=https://www.assets.andgroupco.com

# TTYD (for future terminal commands)
NEXT_PUBLIC_TTYD_API_KEY=api_xxx:secret
```

### VPS Server

- **Upload endpoint**: `http://31.97.41.230:3044/upload`
- **File storage**: `/var/www/assets/{clientId}/{projectName}/{assetType}/{filename}`
- **Public access**: `https://www.assets.andgroupco.com/assets/{path}`

## 📝 API Usage

### Upload Large File

```javascript
const formData = new FormData();
formData.append("file", file);
formData.append("client_id", "ekddigital");
formData.append("project_name", "dashboard-test");
formData.append("asset_type", "video");

const response = await fetch("/api/v1/assets/upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`, // Auth token required!
  },
  body: formData,
});

const result = await response.json();
console.log("Upload successful:", result);
```

### Response Format

```json
{
  "id": "uuid",
  "name": "original-filename.mp4",
  "size": 91969595,
  "mime_type": "video/mp4",
  "client_id": "ekddigital",
  "project_name": "dashboard-test",
  "asset_type": "video",
  "file_path": "ekddigital/dashboard-test/video/1759712735755-3cf6og.mp4",
  "download_url": "/assets/ekddigital/dashboard-test/video/...",
  "server_saved": true,
  "vps_error": null,
  "algorithm_results": {
    "session_id": "asset_xxx",
    "strategies_used": ["vps-direct-upload"],
    "total_processing_time": 1
  }
}
```

## 🎯 Benefits

1. **No CORS Errors** ✅

   - All external calls happen server-side
   - Browser only communicates with same-origin

2. **Large File Support** ✅

   - Tested with 87.71MB video
   - No Vercel 4MB body limit issues
   - Binary transfer (no base64 bloat)

3. **Fast Performance** ⚡

   - Skips orchestrator for >50MB files
   - Skips base64 for VPS-uploaded files
   - Direct binary transfer to VPS

4. **Reliable Fallback** 🛡️
   - VPS fails → Database backup (for small files)
   - Database stores metadata always
   - Multiple retry attempts with backoff

## 🔒 Security

- **Authentication**: JWT token required for all uploads
- **Authorization**: User-owned assets only
- **VPS**: Password-protected upload endpoint
- **Rate limiting**: Handled by Next.js API route

## 📦 Database Storage

### When File Content is Stored in DB

- Small files (<10MB)
- VPS upload failed
- Base64 in `customMetadata.fileContent`

### When File Content is NOT Stored in DB

- Large files (>10MB) successfully uploaded to VPS
- Flag: `customMetadata.vpsOnly = true`
- Saves database space and improves performance

## 🚀 Next Steps

1. **Test with various file sizes**

   - [x] 87MB video
   - [ ] 1MB image
   - [ ] 200MB video
   - [ ] 1GB file

2. **Monitor VPS performance**

   - Check disk space
   - Monitor upload speeds
   - Review error logs

3. **Production deployment**
   - Deploy to Vercel
   - Test with production VPS
   - Monitor success rates

## 📞 Troubleshooting

### "Authentication required"

- Check if auth token is being passed in headers
- Verify token is not expired
- Check browser console for token

### "VPS upload failed"

- Check VPS server is running: `curl http://31.97.41.230:3044/health`
- Check VPS disk space: `df -h /var/www/assets`
- Check VPS logs: `pm2 logs vps-upload-server`

### Upload taking too long

- Large files (>100MB) may take 1-2 minutes
- 5-minute timeout configured
- Check VPS network speed

## 📚 Related Files

- **API Route**: `src/app/api/v1/assets/upload/route.ts`
- **Client**: `src/lib/api/client.ts`
- **VPS Manager**: `src/lib/vps-file-manager.ts`
- **TTYD Manager**: `src/lib/ttyd-asset-manager.ts` (for future use)
- **Upload Component**: `src/components/upload/EnhancedFileUploadArea.tsx`
