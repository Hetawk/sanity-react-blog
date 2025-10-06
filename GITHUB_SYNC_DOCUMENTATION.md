# GitHub Auto-Sync System Documentation

## 🎯 Overview

The GitHub Auto-Sync system automatically syncs all repositories from your GitHub accounts to your portfolio database. It analyzes project structure, generates descriptions, and makes them ready for showcase on your portfolio website.

---

## 🌟 Features

### Automatic Repository Discovery

- ✅ Fetches **all repositories** (public & private) from both accounts
- ✅ **Pagination support** for accounts with many repos
- ✅ **Rate limiting** to respect GitHub API limits
- ✅ **Incremental updates** - updates existing projects with latest data

### Intelligent Project Analysis

- ✅ **Deep folder structure analysis** - understands project organization
- ✅ **Tech stack detection** - identifies languages, frameworks, libraries
- ✅ **Project categorization** - Web App, Mobile, Data Science, etc.
- ✅ **Complexity assessment** - Simple, Medium, Complex, Very Complex
- ✅ **Auto-generated descriptions** for repos without README
- ✅ **Feature detection** - Tests, CI/CD, Docker, Documentation

### Smart Content Management

- ✅ **Default placeholder images** - GitHub logo as default
- ✅ **Draft mode by default** - projects start as drafts
- ✅ **Manual curation** - publish and update via dashboard
- ✅ **Private repo support** - marks private repos (non-clickable links)
- ✅ **Soft delete support** - never loses data

### GitHub Metrics

- ✅ Stars, forks, watchers, issues count
- ✅ Contributors list
- ✅ Repository topics/tags
- ✅ Creation and update timestamps
- ✅ License information

---

## 📋 Setup

### 1. Environment Variables

Add your GitHub tokens to `backend_api/.env`:

```env
# GitHub Personal Access Tokens
EKDDIGITAL_TOKEN=ghp_your_ekddigital_token_here
HETAWK_TOKEN=ghp_your_hetawk_token_here
```

**Token Permissions Required:**

- `repo` - Access private repositories
- `read:user` - Read user profile data
- `read:org` - Read organization data (if applicable)

### 2. Install Dependencies

```bash
cd backend_api
npm install @octokit/rest
```

### 3. Run Initial Sync

```bash
# Option 1: Using script
node scripts/syncGithubRepos.js

# Option 2: Using API endpoint (server must be running)
curl -X POST http://localhost:5001/api/github-sync
```

---

## 🚀 Usage

### Manual Sync via Script

```bash
node scripts/syncGithubRepos.js
```

**Output:**

```
🚀 Starting GitHub Repository Auto-Sync...

📦 Fetching repositories from EKD Digital...
📄 Fetched page 1 for ekddigital (30 repos)
Found 30 repositories

🔄 Syncing: ekddigital/portfolio
✅ Synced: portfolio (Public)

🔄 Syncing: ekddigital/mobile-app
✅ Synced: mobile app (Private)

...

============================================================
✨ GitHub Sync Complete!
============================================================
Total Repositories: 45
Successfully Synced: 43
Failed: 2
Duration: 127.45 seconds
============================================================
```

### Sync via API Endpoint

#### Trigger Sync

```bash
POST /api/github-sync
```

**Response:**

```json
{
  "success": true,
  "message": "GitHub sync started in background. Check server logs for progress.",
  "timestamp": "2025-10-06T10:30:00.000Z"
}
```

#### Get Sync Status

```bash
GET /api/github-sync/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 45,
    "totalStars": 234,
    "totalForks": 67,
    "avgStars": 5,
    "avgForks": 1,
    "recentlySynced": [
      {
        "title": "portfolio",
        "githubUrl": "https://github.com/ekddigital/portfolio",
        "githubStars": 12,
        "githubForks": 3,
        "updatedAt": "2025-10-06T10:25:00.000Z",
        "isPrivateRepo": false
      }
    ],
    "byCategory": [
      { "projectCategory": "Web Application", "_count": { "id": 25 } },
      { "projectCategory": "Mobile Application", "_count": { "id": 10 } },
      { "projectCategory": "Python Application", "_count": { "id": 8 } }
    ],
    "topLanguages": [
      { "language": "JavaScript", "count": 20 },
      { "language": "TypeScript", "count": 15 },
      { "language": "Python", "count": 10 }
    ]
  }
}
```

#### Get All GitHub Projects (with Pagination)

```bash
GET /api/github-sync/projects?page=1&limit=20&category=Web%20Application
```

**Query Parameters:**

- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `category` - Filter by project category
- `language` - Filter by programming language
- `isPrivate` - Filter by private/public (true/false)
- `hasTests` - Filter by test coverage (true/false)
- `complexity` - Filter by complexity (Simple, Medium, Complex, Very Complex)
- `sort` - Sort field (prefix with `-` for descending, e.g., `-githubStars`)

**Response:**

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "title": "portfolio",
        "description": "Personal portfolio website...",
        "imgUrl": "https://github.githubassets.com/images/...",
        "githubUrl": "https://github.com/ekddigital/portfolio",
        "githubOwner": "ekddigital",
        "githubRepo": "portfolio",
        "isPrivateRepo": false,
        "githubStars": 12,
        "githubForks": 3,
        "projectCategory": "Web Application",
        "projectSubCategory": "Full-Stack",
        "languages": "[\"JavaScript\", \"TypeScript\"]",
        "frameworks": "[\"React\", \"Next.js\"]",
        "complexity": "Complex",
        "hasTests": true,
        "hasDocs": true,
        "hasCI": true,
        "hasDocker": true,
        "isPublished": false,
        "isDraft": true,
        "isFeatured": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

#### Publish a Project

```bash
POST /api/github-sync/projects/:id/publish
```

**Response:**

```json
{
  "success": true,
  "data": { ...project },
  "message": "Project published successfully"
}
```

#### Update a Project

```bash
PATCH /api/github-sync/projects/:id
Content-Type: application/json

{
  "description": "Updated description",
  "imgUrl": "https://your-cdn.com/project-image.png",
  "isFeatured": true,
  "category": "Professional"
}
```

**Allowed Update Fields:**

- `description` - Custom description
- `imgUrl` - Custom project image
- `projectLink` - Demo/live URL
- `isPublished` - Publish status
- `isDraft` - Draft status
- `isFeatured` - Featured status
- `displayOrder` - Display order
- `category` - Custom category
- `duration` - Project duration
- `role` - Your role
- `impact` - Project impact/metrics

---

## 🎨 Dashboard Integration

### Workflow

1. **Auto-Sync** - Run sync to import all repos
2. **Review** - Visit dashboard to see all imported projects (in draft)
3. **Curate** - For each project:
   - Upload custom project screenshot/image
   - Update description if auto-generated isn't perfect
   - Add project duration, role, impact
   - Toggle featured status for best projects
4. **Publish** - Publish selected projects to showcase on portfolio
5. **Private Repos** - Private repos will be marked non-clickable automatically

### Dashboard Features

- **Project Grid** - View all synced projects
- **Filter & Sort** - By category, language, complexity, etc.
- **Bulk Actions** - Publish multiple, feature multiple
- **Image Upload** - Drag & drop project screenshots
- **Rich Editor** - Edit descriptions with markdown support
- **Metrics Display** - Show stars, forks, languages
- **Auto-Update** - Re-sync button to update metrics

---

## 🔍 Project Analysis Details

### Categories Detected

| Category               | Indicators                                         |
| ---------------------- | -------------------------------------------------- |
| **Web Application**    | package.json, React, Vue, Angular, Express, Django |
| **Mobile Application** | React Native, Flutter, Swift, Kotlin               |
| **Data Science/ML**    | Python + jupyter, pandas, tensorflow, scikit-learn |
| **Java Application**   | pom.xml, Spring Boot                               |
| **Python Application** | requirements.txt                                   |
| **Rust Application**   | Cargo.toml                                         |
| **Go Application**     | go.mod                                             |

### Frameworks Detected

- **Frontend**: React, Vue.js, Angular, Next.js, Nuxt.js
- **Backend**: Express.js, Django, Flask, Spring Boot, FastAPI
- **Mobile**: React Native, Flutter
- **Desktop**: Electron, Tauri

### Tech Stack Detection

```javascript
{
  "languages": ["JavaScript", "TypeScript", "Python"],
  "frameworks": ["React", "Next.js", "Express.js"],
  "uiLibraries": ["Tailwind CSS", "Material-UI"],
  "databases": ["PostgreSQL", "MongoDB", "Prisma ORM"],
  "testingTools": ["Jest", "Cypress", "Pytest"],
  "buildTools": ["Vite", "Webpack"],
  "deploymentTools": ["Docker", "Kubernetes", "Vercel"]
}
```

### Complexity Levels

- **Simple** - < 20 files
- **Medium** - 20-100 files
- **Complex** - 100-300 files
- **Very Complex** - 300+ files

---

## 📊 Database Schema

The system uses the enhanced `Work` model with GitHub-specific fields:

```prisma
model Work {
  // Basic Info
  id              String   @id @default(uuid())
  title           String
  description     String?
  imgUrl          String?  // Default: GitHub placeholder

  // GitHub Integration
  githubUrl       String?
  githubOwner     String?
  githubRepo      String?
  isPrivateRepo   Boolean  @default(false)
  isGithubProject Boolean  @default(false)

  // Metrics
  githubStars     Int?
  githubForks     Int?
  githubWatchers  Int?
  githubIssues    Int?

  // Analysis
  projectCategory    String?
  projectSubCategory String?
  totalFiles         Int?
  totalFolders       Int?
  complexity         String?

  // Tech Stack
  languages       String?  // JSON array
  frameworks      String?  // JSON array
  uiLibraries     String?  // JSON array
  databases       String?  // JSON array
  testingTools    String?  // JSON array

  // Features
  hasTests  Boolean @default(false)
  hasDocs   Boolean @default(false)
  hasCI     Boolean @default(false)
  hasDocker Boolean @default(false)

  // Content Management
  isPublished Boolean @default(false)
  isDraft     Boolean @default(true)
  isFeatured  Boolean @default(false)

  // Timestamps
  githubCreatedAt DateTime?
  githubUpdatedAt DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## 🔄 Automated Scheduling

### Option 1: Cron Job (Linux/Mac)

```bash
# Run sync every day at 2 AM
0 2 * * * cd /path/to/portfolio && node scripts/syncGithubRepos.js >> logs/github-sync.log 2>&1
```

### Option 2: Node.js Scheduler

```javascript
const cron = require("node-cron");
const {
  syncAllRepositories,
} = require("./backend_api/services/githubSyncService");

// Run every day at 2 AM
cron.schedule("0 2 * * *", () => {
  console.log("Starting scheduled GitHub sync...");
  syncAllRepositories();
});
```

### Option 3: GitHub Actions

```yaml
# .github/workflows/sync-repos.yml
name: Sync GitHub Repositories

on:
  schedule:
    - cron: "0 2 * * *" # Every day at 2 AM
  workflow_dispatch: # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm install
      - run: node scripts/syncGithubRepos.js
        env:
          EKDDIGITAL_TOKEN: ${{ secrets.EKDDIGITAL_TOKEN }}
          HETAWK_TOKEN: ${{ secrets.HETAWK_TOKEN }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 🎯 Best Practices

### 1. Initial Sync

- Run initial sync manually to review results
- Check for any errors or failed repos
- Verify categories and tech stacks are correct

### 2. Regular Updates

- Schedule daily syncs to keep metrics updated
- Stars, forks, and issue counts stay current
- New repos are automatically added

### 3. Manual Curation

- Always upload custom project images
- Enhance auto-generated descriptions
- Add project impact and metrics
- Feature your best projects

### 4. Private Repos

- Private repos are automatically marked
- Links are shown but marked non-clickable
- Consider adding "Private Repository" badge
- Focus on public repos for showcase

### 5. Performance

- Sync runs in background (non-blocking)
- Rate limiting prevents API throttling
- Pagination handles large repo counts
- Upsert prevents duplicate entries

---

## 🐛 Troubleshooting

### Issue: API Rate Limit Exceeded

**Solution:**

- Wait 1 hour for rate limit reset
- Reduce sync frequency
- Use authenticated requests (already done)

### Issue: Sync Takes Too Long

**Solution:**

- Normal for many repos (1 sec per repo)
- Run sync during off-peak hours
- Use background processing (already implemented)

### Issue: Some Repos Not Syncing

**Possible Causes:**

- Repository is empty (no files)
- API timeout
- Invalid token permissions

**Solution:**

- Check server logs for specific errors
- Verify token has `repo` scope
- Manually re-sync failed repos

### Issue: Wrong Project Category

**Solution:**

- Update manually via dashboard
- Improve detection logic in `analyzeProjectStructure()`
- Report patterns for future enhancement

---

## 📈 Future Enhancements

- [ ] AI-powered description generation
- [ ] Automatic screenshot capture of live sites
- [ ] Commit activity graphs
- [ ] Code quality metrics integration
- [ ] Dependency vulnerability scanning
- [ ] Multi-language README support
- [ ] Webhook support for real-time updates

---

## 📞 Support

For issues or questions:

1. Check server logs: `backend_api/logs/`
2. Review error messages in sync output
3. Verify environment variables are set
4. Test tokens with GitHub API directly

---

**Happy Syncing! 🚀**
